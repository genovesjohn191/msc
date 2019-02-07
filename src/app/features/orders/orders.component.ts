import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Router } from '@angular/router';
import {
  McsTextContentProvider,
  CoreDefinition,
  McsBrowserService,
  McsTableListingBase,
  CoreRoutes,
  McsTableDataSource
} from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  RouteKey,
  McsOrder
} from '@app/models';
import { McsOrdersRepository } from '@app/services';

@Component({
  selector: 'mcs-orders',
  templateUrl: './orders.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class OrdersComponent
  extends McsTableListingBase<McsTableDataSource<McsOrder>>
  implements OnInit, AfterViewInit, OnDestroy {

  public textContent: any;

  public constructor(
    _browserService: McsBrowserService,
    _changeDetectorRef: ChangeDetectorRef,
    private _router: Router,
    private _textProvider: McsTextContentProvider,
    private _ordersRepository: McsOrdersRepository
  ) {
    super(_browserService, _changeDetectorRef);
  }

  public ngOnInit() {
    this.textContent = this._textProvider.content.orders;
  }

  public ngAfterViewInit() {
    Promise.resolve().then(() => this.initializeDatasource());
  }

  public ngOnDestroy() {
    this.dispose();
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  /**
   * Returns the + icon key
   */
  public get addIconKey(): string {
    return CoreDefinition.ASSETS_FONT_PLUS;
  }

  /**
   * Creates a new order
   */
  public onClickNewOrder(): void {
    // Do the create order
  }

  /**
   * Navigate to order details page
   * @param order Order to view the details
   */
  public navigateToOrder(order: McsOrder): void {
    if (isNullOrEmpty(order)) { return; }
    this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.OrderDetail), order.id]);
  }

  /**
   * Retry obtaining datasource from server
   */
  public retryDatasource(): void {
    this.initializeDatasource();
  }

  /**
   * Returns the column settings key for the filter selector
   */
  protected get columnSettingsKey(): string {
    return CoreDefinition.FILTERSELECTOR_ORDER_LISTING;
  }

  /**
   * Initialize the table datasource according to pagination and search settings
   */
  protected initializeDatasource(): void {
    // Set datasource instance
    this.dataSource = new McsTableDataSource(this._ordersRepository);
    this.dataSource
      .registerSearch(this.search)
      .registerPaginator(this.paginator);
    this.changeDetectorRef.markForCheck();
  }
}
