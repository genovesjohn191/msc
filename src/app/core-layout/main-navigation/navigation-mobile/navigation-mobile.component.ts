import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  Renderer2,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewEncapsulation
} from '@angular/core';
import {
  Router,
  NavigationStart
} from '@angular/router';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
/** Providers / Services */
import {
  CoreDefinition,
  McsApiCompany,
  McsAuthenticationIdentity,
  McsAuthenticationService,
  McsTextContentProvider,
  McsDataStatusFactory
} from '../../../core';
import {
  resolveEnvVar,
  registerEvent,
  unregisterEvent,
  unsubscribeSafely,
  isNullOrEmpty
} from '../../../utilities';
import {
  Product,
  ProductCatalog,
  ProductCatalogRepository
} from '../../../features/products';

@Component({
  selector: 'mcs-navigation-mobile',
  templateUrl: './navigation-mobile.component.html',
  styleUrls: ['./navigation-mobile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('indicatorIcon', [
      state('collapsed', style({ transform: 'rotate(0deg)' })),
      state('expanded', style({ transform: 'rotate(180deg)' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4,0.0,0.2,1)'))
    ]),
    trigger('bodyExpansion', [
      state('collapsed', style({ height: '0px', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4,0.0,0.2,1)')),
    ])
  ],
})

export class NavigationMobileComponent implements OnInit, OnDestroy {

  @ViewChild('navigationList')
  public navigationList: ElementRef;

  public textContent: any;
  public productCatalogs: ProductCatalog[];
  public productsStatusFactory: McsDataStatusFactory<ProductCatalog[]>;
  public switchAccountAnimation: string;
  private _routerSubscription: any;
  private _activeAccountSubscription: any;

  /**
   * Show or hide the navigation element based on slide value
   */
  private _slideTrigger: string;
  public get slideTrigger(): string {
    return this._slideTrigger;
  }
  public set slideTrigger(value: string) {
    if (this._slideTrigger !== value) {
      this._slideTrigger = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * Get the currently active account
   */
  public get activeAccount(): McsApiCompany {
    return this._authenticationIdentity.activeAccount;
  }

  public get macquarieViewUrl(): string {
    return resolveEnvVar('MACQUARIE_VIEW_URL');
  }

  public get toggleIconKey(): string {
    return CoreDefinition.ASSETS_SVG_TOGGLE_NAV;
  }

  public get arrowUpIconKey(): string {
    return CoreDefinition.ASSETS_SVG_ARROW_UP_WHITE;
  }

  public get caretRightIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CARET_RIGHT;
  }

  public get caretDownIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_DOWN;
  }

  public get closeIconKey(): string {
    return CoreDefinition.ASSETS_SVG_CLOSE_WHITE;
  }

  public get firstName(): string {
    return this._authenticationIdentity.user.firstName;
  }

  public get lastName(): string {
    return this._authenticationIdentity.user.lastName;
  }

  /**
   * Returns true when feature flag is on for product catalog
   */
  public get productCatalogFeatureIsOn(): boolean {
    return this._productCatalogRepository.productCatalogFeatureIsOn;
  }

  /**
   * Event handler references
   */
  private _clickOutsideHandler = this.onClickOutside.bind(this);

  public constructor(
    private _elementRef: ElementRef,
    private _renderer: Renderer2,
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _authenticationService: McsAuthenticationService,
    private _textContentProvider: McsTextContentProvider,
    private _productCatalogRepository: ProductCatalogRepository
  ) {
    this.switchAccountAnimation = 'collapsed';
    this.productsStatusFactory = new McsDataStatusFactory(this._changeDetectorRef);
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.navigation;
    this._routerSubscription = this._router.events
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.close();
        }
      });
    registerEvent(document, 'click', this._clickOutsideHandler);
    this._listenToSwitchAccount();
    this._getProductCatalogs();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._routerSubscription);
    unsubscribeSafely(this._activeAccountSubscription);
    unregisterEvent(document, 'click', this._clickOutsideHandler);
  }

  /**
   * Logout the current user and navigate to auth page
   */
  public logout(event): void {
    event.preventDefault();
    this._authenticationService.logOut();
  }

  /**
   * Event that emits when user clicks outside the popover boundary
   */
  public onClickOutside(_event: any): void {
    if (!this._elementRef.nativeElement.contains(_event.target)) {
      this.close();
    }
  }

  /**
   * Toggle the account panel
   */
  public toggleAccountPanel(): void {
    this.switchAccountAnimation = this.switchAccountAnimation === 'expanded' ?
      'collapsed' : 'expanded';
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Opens the navigation panel
   */
  public open(): void {
    this._renderer.setStyle(this.navigationList.nativeElement, 'display', 'block');
    this.slideTrigger = 'slideInLeft';
  }

  /**
   * Closes the navigation panel
   */
  public close(): void {
    if (this.slideTrigger) {
      this.slideTrigger = 'slideOutLeft';
    }
  }

  /**
   * Navigate to product catalog
   * @param product Product to be navigated
   */
  public gotoProduct(_product: Product) {
    if (isNullOrEmpty(_product)) { return; }
    this._router.navigate(['/products/', _product.id]);
  }

  /**
   * Gets the product catalogs
   */
  private _getProductCatalogs(): void {
    this.productsStatusFactory.setInProgress();
    this._productCatalogRepository.findAllRecords()
      .pipe(
        catchError((error) => {
          this.productsStatusFactory.setError();
          return Observable.throw(error);
        })
      )
      .subscribe((response) => {
        this.productsStatusFactory.setSuccesfull(response);
        if (isNullOrEmpty(response)) { return; }
        this.productCatalogs = response;
      });
  }

  /**
   * Listens to account switching
   */
  private _listenToSwitchAccount(): void {
    this._activeAccountSubscription = this._authenticationIdentity
      .activeAccountChanged
      .subscribe(() => {
        // Refresh the page when account is selected
        this._changeDetectorRef.markForCheck();
      });
  }
}
