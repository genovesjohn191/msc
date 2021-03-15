import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  ViewChild
} from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsAzureService,
  McsFilterInfo,
  McsQueryParam,
  RouteKey
} from '@app/models';
import {
  CommonDefinition,
  createObject,
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';
import {
  CoreRoutes,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsTableDataSource2,
  McsTableEvents
} from '@app/core';
import { McsApiService } from '@app/services';
import { McsEvent } from '@app/events';
import {
  ColumnFilter,
  Paginator,
  Search
} from '@app/shared';

@Component({
  selector: 'app-azure-managed-services',
  templateUrl: './azure-managed-services.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AzureManagedServicesComponent {

  public get columnSettingsKey(): string {
    return CommonDefinition.FILTERSELECTOR_AZURE_MANAGED_SERVICES_LISTING;
  }

  public get cogIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ELLIPSIS_HORIZONTAL;
  }

  public readonly dataSource: McsTableDataSource2<McsAzureService>;
  public readonly dataEvents: McsTableEvents<McsAzureService>;
  public readonly defaultColumnFilters: McsFilterInfo[] = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'name' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'serviceId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'parent' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'action' })
  ];

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService,
  ) {
    this.dataSource = new McsTableDataSource2(this._getAzureServices.bind(this));
    this.dataEvents = new McsTableEvents(_injector, this.dataSource, {
      dataChangeEvent: McsEvent.dataChangeAzureManagedServices
    });
  }

  @ViewChild('search')
  public set search(value: Search) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerSearch(value);
    }
  }

  @ViewChild('paginator')
  public set paginator(value: Paginator) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerPaginator(value);
    }
  }

  @ViewChild('columnFilter')
  public set columnFilter(value: ColumnFilter) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerColumnFilter(value);
    }
  }

  private _getAzureServices(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsAzureService>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);

    return this._apiService.getAzureServices(queryParam).pipe(
      map(response => new McsMatTableContext(response?.collection,
        response?.totalCollectionCount))
    );
  }

  /**
   * Navigate to create a ticket
   */
  public onRaiseTicket(service: McsAzureService): string {
    return isNullOrEmpty(service.serviceId) ?
      CoreRoutes.getNavigationPath(RouteKey.TicketCreate) :
      `${CoreRoutes.getNavigationPath(RouteKey.TicketCreate)}?serviceId=${service.serviceId}`;
  }

  /**
   * Navigate to service request
   */
  public azureServiceRequestLink(service: McsAzureService): string {
    return isNullOrEmpty(service.serviceId) ?
      CoreRoutes.getNavigationPath(RouteKey.OrderMsRequestChange) :
      `${CoreRoutes.getNavigationPath(RouteKey.OrderMsRequestChange)}?serviceId=${service.serviceId}`;
  }
}
