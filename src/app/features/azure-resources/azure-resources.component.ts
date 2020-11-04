import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector } from '@angular/core';
import { CoreRoutes, McsTableListingBase } from '@app/core';
import { Observable } from 'rxjs';
import { McsEvent } from '@app/events';
import { McsApiCollection, McsAzureResource, McsQueryParam, RouteKey } from '@app/models';
import { McsApiService } from '@app/services';
import { CommonDefinition, isNullOrEmpty } from '@app/utilities';

@Component({
  selector: 'app-azure-resources',
  templateUrl: './azure-resources.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AzureResourcesComponent extends McsTableListingBase<McsAzureResource> {

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService,
  ) {
    super(_injector, _changeDetectorRef, {
      dataChangeEvent: McsEvent.dataChangeAzureResources
    })
  }

  /**
   * Returns the column settings key for the filter selector
   */
  public get columnSettingsKey(): string {
    return CommonDefinition.FILTERSELECTOR_AZURE_RESOURCES_LISTING;
  }

  public get cogIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ELLIPSIS_HORIZONTAL;
  }

  protected getEntityListing(query: McsQueryParam): Observable<McsApiCollection<McsAzureResource>> {
    return this._apiService.getAzureResources(query);
  }

  /**
   * Navigate to request change
   */
  public get onRequestChange(): string {
    return CoreRoutes.getNavigationPath(RouteKey.OrderMsRequestChange);
  }

  /**
   * Navigate to create a ticket
   */
  public onRaiseTicket(resource: McsAzureResource): string {
    return isNullOrEmpty(resource.serviceId) ?
      CoreRoutes.getNavigationPath(RouteKey.TicketCreate) :
      `${CoreRoutes.getNavigationPath(RouteKey.TicketCreate)}?serviceId=${resource.serviceId}`;
  }
}