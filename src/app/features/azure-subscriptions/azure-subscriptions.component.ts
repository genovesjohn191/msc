import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  ViewChild
} from '@angular/core';
import {
  Observable,
  throwError
} from 'rxjs';
import {
  catchError,
  map
} from 'rxjs/operators';
import {
  McsAzureService,
  McsAzureServicesRequestParams,
  McsFilterInfo,
  RouteKey
} from '@app/models';
import {
  CommonDefinition,
  createObject,
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';
import {
  McsMatTableContext,
  McsMatTableQueryParam,
  McsNavigationService,
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
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'mcs-azure-subscriptions',
  templateUrl: './azure-subscriptions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AzureSubscriptionsComponent {

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

  private _sortDirection: string;
  private _sortField: string;
  public isSorting: boolean;

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService,
    private _navigationService: McsNavigationService
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

  public onSortChange(sortState: Sort) {
    this.isSorting = true;
    this._sortDirection = sortState.direction;
    this._sortField = sortState.active;
    this.retryDatasource();
  }

  private _getAzureServices(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsAzureService>> {
    let queryParam = new McsAzureServicesRequestParams();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);
    queryParam.sortDirection = this._sortDirection;
    queryParam.sortField = this._sortField;

    return this._apiService.getAzureServices(queryParam).pipe(
      catchError((error) => {
        this.isSorting = false;
        return throwError(error);
      }),
      map(response => {
        this.isSorting = false;
        return new McsMatTableContext(response?.collection,
        response?.totalCollectionCount)
      })
    );
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  /**
   * Navigate to create a ticket
   */
  public onRaiseTicket(service: McsAzureService): void {
    return isNullOrEmpty(service.serviceId) ?
      this._navigationService.navigateTo(RouteKey.TicketCreate) :
      this._navigationService.navigateTo(RouteKey.TicketCreate, [], { queryParams: { serviceId: service.serviceId}});
  }

  /**
   * Navigate to service request
   */
  public azureServiceRequestLink(service: McsAzureService): void {
    return isNullOrEmpty(service.serviceId) ?
      this._navigationService.navigateTo(RouteKey.OrderMsRequestChange) :
      this._navigationService.navigateTo(RouteKey.OrderMsRequestChange, [], { queryParams: { serviceId: service.serviceId}});
  }
}
