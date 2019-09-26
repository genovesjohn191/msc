import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ChangeDetectorRef
} from '@angular/core';
import {
  throwError,
  BehaviorSubject,
  Subscription
} from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  CoreConfig,
  McsDataStatusFactory,
  McsAccessControlService,
  McsNavigationService
} from '@app/core';
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
import {
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';
import { McsApiService } from '@app/services';
import { McsEvent } from '@app/events';

@Component({
  selector: 'mcs-navigation-desktop',
  templateUrl: './navigation-desktop.component.html',
  styleUrls: ['./navigation-desktop.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class NavigationDesktopComponent implements OnInit, OnDestroy {
  public productCatalogs: McsProductCatalog[];
  public productsStatusFactory: McsDataStatusFactory<McsProductCatalog[]>;

  @EventBusPropertyListenOn(McsEvent.productSelected)
  public selectedProduct$: BehaviorSubject<McsProduct>;

  public get arrowUpIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ARROW_UP_WHITE;
  }

  public get caretDownIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_DOWN;
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  private _productUnselectedHandler: Subscription;

  constructor(
    private _navigationService: McsNavigationService,
    private _coreConfig: CoreConfig,
    private _changeDetectorRef: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _accessControl: McsAccessControlService,
    private _apiService: McsApiService
  ) {
    this.productsStatusFactory = new McsDataStatusFactory(this._changeDetectorRef);
  }

  public ngOnInit() {
    this._registerEvents();
    this._getProductCatalogs();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._productUnselectedHandler);
  }

  /**
   * Returns the macquarie view url
   */
  public get macviewUrl(): string {
    return this._coreConfig.macviewUrl;
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
  }

  /**
   * Event that gets notified when product has been unselected
   */
  private _onProductUnSelected(): void {
    this.selectedProduct$.next({} as any);
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
      this.productCatalogs = catalogs;
    });
  }
}
