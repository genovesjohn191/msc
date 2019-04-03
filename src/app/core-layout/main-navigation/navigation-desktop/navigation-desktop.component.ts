import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ChangeDetectorRef
} from '@angular/core';
import { Router } from '@angular/router';
import {
  throwError,
  BehaviorSubject,
  Subscription
} from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  CoreRoutes,
  CoreConfig,
  CoreEvent,
  CoreDefinition,
  McsDataStatusFactory
} from '@app/core';
import {
  RouteKey,
  McsProduct,
  McsProductCatalog
} from '@app/models';
import {
  EventBusPropertyListenOn,
  EventBusDispatcherService
} from '@app/event-bus';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { McsProductCatalogRepository } from '@app/services';
import { McsAccessControlService } from '@app/core/authentication/mcs-access-control.service';

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

  @EventBusPropertyListenOn(CoreEvent.productSelected)
  public selectedProduct$: BehaviorSubject<McsProduct>;

  public get arrowUpIconKey(): string {
    return CoreDefinition.ASSETS_SVG_ARROW_UP_WHITE;
  }

  public get caretDownIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_DOWN;
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  private _productUnselectedHandler: Subscription;

  constructor(
    private _router: Router,
    private _coreConfig: CoreConfig,
    private _changeDetectorRef: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _accessControl: McsAccessControlService,
    private _productCatalogRepository: McsProductCatalogRepository
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
   * Returns true when feature flag is on for product catalog
   */
  public get productCatalogFeatureIsOn(): boolean {
    return this._productCatalogRepository.productCatalogFeatureIsOn;
  }

  /**
   * Navigate to product catalog
   * @param product Product to be navigated
   */
  public gotoProduct(_product: McsProduct) {
    if (isNullOrEmpty(_product)) { return; }
    this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.ProductDetails), _product.id]);
  }

  /**
   * Register events state
   */
  private _registerEvents(): void {
    this._productUnselectedHandler = this._eventDispatcher.addEventListener(
      CoreEvent.productUnSelected, this._onProductUnSelected.bind(this)
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
    if (!this._accessControl.hasAccessToFeature('EnableProductCatalog')) { return; }

    this._productCatalogRepository.getAll().pipe(
      catchError((error) => {
        this.productsStatusFactory.setError();
        return throwError(error);
      })
    ).subscribe((response) => {
      this.productsStatusFactory.setSuccessful(response);
      this.productCatalogs = response;
    });
  }
}
