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
/** Providers / Services */
import {
  CoreDefinition,
  McsApiCompany,
  McsAuthenticationIdentity,
  McsAuthenticationService,
  McsTextContentProvider,
  McsAccessControlService
} from '../../../core';
import {
  resolveEnvVar,
  registerEvent,
  unregisterEvent,
  unsubscribeSafely
} from '../../../utilities';

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
    return this._accessControlService.hasAccessToFeature('enableProductCatalog');
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
    private _accessControlService: McsAccessControlService
  ) {
    this.switchAccountAnimation = 'collapsed';
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
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._routerSubscription);
    unsubscribeSafely(this._activeAccountSubscription);
    unregisterEvent(document, 'click', this._clickOutsideHandler);
  }

  /**
   * Navigate to product catalog
   * @param product Product to be navigated
   */
  public gotoProduct(_product: any) {
    // TODO: Id was set temporarily, this should be a mega-menu
    // so that the user can choose the product
    this._router.navigate(['/products/', '01147ad4-5a46-4af5-855b-9c09a64bb768']);
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
