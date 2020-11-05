import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { McsApiCollection, McsAzureService, McsQueryParam, RouteKey } from '@app/models';
import { CommonDefinition, isNullOrEmpty } from '@app/utilities';
import { CoreRoutes, McsTableListingBase } from '@app/core';
import { McsApiService } from '@app/services';
import { McsEvent } from '@app/events';

@Component({
  selector: 'app-azure-managed-services',
  templateUrl: './azure-managed-services.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AzureManagedServicesComponent extends McsTableListingBase<McsAzureService> {

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService,
  ) {
    super(_injector, _changeDetectorRef, {
      dataChangeEvent: McsEvent.dataChangeAzureManagedServices
    });
  }

  protected getEntityListing(query: McsQueryParam): Observable<McsApiCollection<McsAzureService>> {
    return this._apiService.getAzureServices(query);
  }

  /**
   * Returns the column settings key for the filter selector
   */
  public get columnSettingsKey(): string {
    return CommonDefinition.FILTERSELECTOR_AZURE_MANAGED_SERVICES_LISTING;
  }

  public get cogIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ELLIPSIS_HORIZONTAL;
  }

  /**
   * Navigate to create a ticket
   */
  public onRaiseTicket(resource: McsAzureService): string {
    return isNullOrEmpty(resource.serviceId) ?
      CoreRoutes.getNavigationPath(RouteKey.TicketCreate) :
      `${CoreRoutes.getNavigationPath(RouteKey.TicketCreate)}?serviceId=${resource.serviceId}`;
  }

  /**
   * Navigate to service request
   */
  public get azureServiceRequestLink(): string {
    return CoreRoutes.getNavigationPath(RouteKey.OrderMsRequestChange);
  }
}
