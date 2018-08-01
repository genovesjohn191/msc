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
  McsRouteKey
} from '../../core';
import {
  refreshView,
  getSafeProperty,
  isNullOrEmpty
} from '../../utilities';
import { OrdersRepository } from './repositories/orders.repository';
import { OrdersDataSource } from './orders.datasource';
import { Order } from './models';

@Component({
  selector: 'mcs-orders',
  templateUrl: './orders.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class OrdersComponent
  extends McsTableListingBase<OrdersDataSource>
  implements OnInit, AfterViewInit, OnDestroy {

  public textContent: any;

  public constructor(
    _browserService: McsBrowserService,
    _changeDetectorRef: ChangeDetectorRef,
    private _router: Router,
    private _textProvider: McsTextContentProvider,
    private _ordersRepository: OrdersRepository
  ) {
    super(_browserService, _changeDetectorRef);
  }

  public ngOnInit() {
    this.textContent = this._textProvider.content.orders;
  }

  public ngAfterViewInit() {
    refreshView(() => this.initializeDatasource());
  }

  public ngOnDestroy() {
    this.dispose();
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
  public navigateToOrder(order: Order): void {
    if (isNullOrEmpty(order)) { return; }
    this._router.navigate([CoreRoutes.getPath(McsRouteKey.Orders), order.id]);
  }

  /**
   * Retry obtaining datasource from server
   */
  public retryDatasource(): void {
    // We need to initialize again the datasource in order for the
    // observable merge work as expected, since it is closing the
    // subscription when error occured.
    this.initializeDatasource();
  }

  /**
   * Returns the totals record found in orders
   */
  protected get totalRecordsCount(): number {
    return getSafeProperty(this._ordersRepository,
      (obj) => obj.totalRecordsCount, 0);
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
    this.dataSource = new OrdersDataSource(
      this._ordersRepository,
      this.paginator,
      this.search
    );
    this.changeDetectorRef.markForCheck();
  }
}
