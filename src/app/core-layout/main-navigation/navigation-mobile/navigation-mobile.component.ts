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
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import {
  throwError,
  Subject,
  Subscription
} from 'rxjs';
import { catchError } from 'rxjs/operators';
/** Providers / Services */
import {
  CoreConfig,
  McsAuthenticationService,
  McsDataStatusFactory,
  McsAccessControlService,
  McsNavigationService
} from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';
import {
  RouteKey,
  McsProduct,
  McsProductCatalog,
  McsFeatureFlag
} from '@app/models';
import {
  EventBusPropertyListenOn,
  EventBusDispatcherService
} from '@peerlancers/ngx-event-bus';
import { SlidingPanelComponent } from '@app/shared';
import { McsApiService } from '@app/services';
import { McsEvent } from '@app/events';

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
  public productCatalogs: McsProductCatalog[];
  public productsStatusFactory: McsDataStatusFactory<McsProductCatalog[]>;
  public switchAccountAnimation: string;

  @ViewChild('slidingPanel')
  public slidingPanel: SlidingPanelComponent;

  @EventBusPropertyListenOn(McsEvent.productSelected)
  public selectedProduct$: Subject<McsProduct>;

  public get macviewUrl(): string {
    return this._coreConfig.macviewUrl;
  }

  public get toggleIconKey(): string {
    return CommonDefinition.ASSETS_SVG_TOGGLE_NAV;
  }

  public get arrowUpIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ARROW_UP_WHITE;
  }

  public get caretRightIconKey(): string {
    return CommonDefinition.ASSETS_FONT_CARET_RIGHT;
  }

  public get caretDownIconKey(): string {
    return CommonDefinition.ASSETS_FONT_CHEVRON_DOWN;
  }

  public get closeIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CLOSE_WHITE;
  }

  private _routeChangeHandler: Subscription;
  private _productUnselectedHandler: Subscription;

  public constructor(
    private _navigationService: McsNavigationService,
    private _coreConfig: CoreConfig,
    private _changeDetectorRef: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _accessControl: McsAccessControlService,
    private _authenticationService: McsAuthenticationService,
    private _apiService: McsApiService
  ) {
    this.switchAccountAnimation = 'collapsed';
    this.productsStatusFactory = new McsDataStatusFactory(this._changeDetectorRef);
  }

  public ngOnInit() {
    this._registerEvents();
    this._getProductCatalogs();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._routeChangeHandler);
    unsubscribeSafely(this._productUnselectedHandler);
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
    this._navigationService.navigateTo(RouteKey.ProductDetails, [_product.id]);
  }

  /**
   * Register events state
   */
  private _registerEvents(): void {
    this._productUnselectedHandler = this._eventDispatcher.addEventListener(
      McsEvent.productUnSelected, this._onProductUnSelected.bind(this)
    );

    this._routeChangeHandler = this._eventDispatcher.addEventListener(
      McsEvent.routeChange, this._onRouteChanged.bind(this)
    );
  }

  /**
   * Event that gets notified when product has been unselected
   */
  private _onProductUnSelected(): void {
    this.selectedProduct$.next({} as any);
  }

  /**
   * Events that gets notified when route has been changed
   */
  private _onRouteChanged(): void {
    this.close();
  }

  /**
   * Gets the product catalogs
   */
  private _getProductCatalogs(): void {
    this.productsStatusFactory.setInProgress();
    if (!this._accessControl.hasAccessToFeature(McsFeatureFlag.ProductCatalog)) { return; }

    this._apiService.getProductCatalogs().pipe(
      catchError((error) => {
        this.productsStatusFactory.setError();
        return throwError(error);
      })
    ).subscribe((response) => {
      let catalogs = response && response.collection;
      this.productsStatusFactory.setSuccessful(catalogs);
    });
  }
}
