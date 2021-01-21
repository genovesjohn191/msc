import {
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Injector
} from '@angular/core';
import { Observable } from 'rxjs';
import {
  McsTableListingBase,
  McsNavigationService,
  McsAuthenticationIdentity
} from '@app/core';
import {
  isNullOrEmpty,
  CommonDefinition
} from '@app/utilities';
import {
  RouteKey,
  McsOrder,
  McsQueryParam,
  McsApiCollection,
  McsCompany
} from '@app/models';
import { McsEvent } from '@app/events';
import { McsApiService } from '@app/services';

@Component({
  selector: 'mcs-orders',
  templateUrl: './orders.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class OrdersComponent extends McsTableListingBase<McsOrder> {

  public constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _navigationService: McsNavigationService,
    private _apiService: McsApiService,
    private _authenticationIdentity: McsAuthenticationIdentity,
  ) {
    super(_injector, _changeDetectorRef, { dataChangeEvent: McsEvent.dataChangeOrders });
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  /**
   * Returns the + icon key
   */
  public get addIconKey(): string {
    return CommonDefinition.ASSETS_SVG_PLUS;
  }

  public get activeCompany(): McsCompany {
    return this._authenticationIdentity.activeAccount;
  }

  /**
   * Whether to show annotation or not
   * @param companyId createdByCompanyId/modifiedByCompanyId of the selected order
   */
  public createdWithDifferentCompany(companyId: string): boolean {
    return companyId && this.activeCompany?.id !== companyId;
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
    this._navigationService.navigateTo(RouteKey.OrderDetails, [order.id]);
  }

  /**
   * Returns the column settings key for the filter selector
   */
  public get columnSettingsKey(): string {
    return CommonDefinition.FILTERSELECTOR_ORDER_LISTING;
  }

  /**
   * Gets the entity listing based on the context
   * @param query Query to be obtained on the listing
   */
  protected getEntityListing(query: McsQueryParam): Observable<McsApiCollection<McsOrder>> {
    return this._apiService.getOrders(query);
  }
}
