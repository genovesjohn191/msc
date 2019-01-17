import {
  Component,
  OnInit,
  OnDestroy,
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
import {
  throwError,
  Subject
} from 'rxjs';
import {
  catchError,
  takeUntil
} from 'rxjs/operators';
/** Providers / Services */
import {
  CoreConfig,
  CoreDefinition,
  McsAuthenticationIdentity,
  McsAuthenticationService,
  McsTextContentProvider,
  McsDataStatusFactory,
  CoreRoutes
} from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSubject
} from '@app/utilities';
import {
  McsCompany,
  RouteKey,
  McsProduct,
  McsProductCatalog
} from '@app/models';
import { SlidingPanelComponent } from '@app/shared';
import { McsProductCatalogRepository } from '@app/services';

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
  @ViewChild('slidingPanel')
  public slidingPanel: SlidingPanelComponent;

  public textContent: any;
  public productCatalogs: McsProductCatalog[];
  public productsStatusFactory: McsDataStatusFactory<McsProductCatalog[]>;
  public switchAccountAnimation: string;
  private _destroySubject = new Subject<void>();

  /**
   * Get the currently active account
   */
  public get activeAccount(): McsCompany {
    return this._authenticationIdentity.activeAccount;
  }

  public get macviewUrl(): string {
    return this._coreConfig.macviewUrl;
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

  public constructor(
    private _router: Router,
    private _coreConfig: CoreConfig,
    private _changeDetectorRef: ChangeDetectorRef,
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _authenticationService: McsAuthenticationService,
    private _textContentProvider: McsTextContentProvider,
    private _productCatalogRepository: McsProductCatalogRepository
  ) {
    this.switchAccountAnimation = 'collapsed';
    this.productsStatusFactory = new McsDataStatusFactory(this._changeDetectorRef);
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.navigation;
    this._listenToRouterEvents();
    this._listenToSwitchAccount();
    this._getProductCatalogs();
  }

  public ngOnDestroy() {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Logout the current user and navigate to auth page
   */
  public logout(event): void {
    event.preventDefault();
    this._authenticationService.logOut();
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
    this.slidingPanel.open();
  }

  /**
   * Closes the navigation panel
   */
  public close(): void {
    this.slidingPanel.close();
  }

  /**
   * Navigate to product catalog
   * @param product Product to be navigated
   */
  public gotoProduct(_product: McsProduct) {
    if (isNullOrEmpty(_product)) { return; }
    this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.ProductDetail), _product.id]);
  }

  /**
   * Gets the product catalogs
   */
  private _getProductCatalogs(): void {
    this.productsStatusFactory.setInProgress();
    this._productCatalogRepository.getAll()
      .pipe(
        catchError((error) => {
          this.productsStatusFactory.setError();
          return throwError(error);
        })
      )
      .subscribe((response) => {
        this.productsStatusFactory.setSuccessful(response);
        if (isNullOrEmpty(response)) { return; }
        this.productCatalogs = response;
      });
  }

  /**
   * Listens to every account changes
   */
  private _listenToSwitchAccount(): void {
    this._authenticationIdentity.activeAccountChanged
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => {
        // Refresh the page when account is selected
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Listens to every router event changes
   */
  private _listenToRouterEvents(): void {
    this._router.events
      .pipe(takeUntil(this._destroySubject))
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.close();
        }
      });
  }
}
