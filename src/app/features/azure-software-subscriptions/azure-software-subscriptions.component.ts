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
  McsMatTableContext,
  McsMatTableQueryParam,
  McsNavigationService,
  McsTableDataSource2,
  McsTableEvents
} from '@app/core';
import { McsEvent } from '@app/events';
import {
  McsAzureSoftwareSubscription,
  McsFilterInfo,
  McsQueryParam,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  ColumnFilter,
  Paginator,
  Search
} from '@app/shared';
import {
  CommonDefinition,
  createObject,
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';

@Component({
  selector: 'app-azure-software-subscriptions',
  templateUrl: './azure-software-subscriptions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AzureSoftwareSubscriptionsComponent {

  public get cogIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ELLIPSIS_HORIZONTAL;
  }

  public readonly dataSource: McsTableDataSource2<McsAzureSoftwareSubscription>;
  public readonly dataEvents: McsTableEvents<McsAzureSoftwareSubscription>;
  public readonly defaultColumnFilters: McsFilterInfo[] = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'name' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'type' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'quantity' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'offerId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'subscriptionId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'cost' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'billingTerm' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'serviceId' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'action' })
  ];

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService,
    private _navigationService: McsNavigationService
  ) {
    this.dataSource = new McsTableDataSource2(this._getAzureSoftwareSubscriptions.bind(this));
    this.dataEvents = new McsTableEvents(_injector, this.dataSource, {
      dataChangeEvent: McsEvent.dataChangeAzureSoftwareSubscriptions
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

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  /**
   * Navigate to create a ticket
   */
  public onRaiseTicket(service: McsAzureSoftwareSubscription): void {
    isNullOrEmpty(service.serviceId) ?
      this._navigationService.navigateTo(RouteKey.TicketCreate) :
      this._navigationService.navigateTo(RouteKey.TicketCreate, [], { queryParams: { serviceId: service.serviceId}});
  }

  private _getAzureSoftwareSubscriptions(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsAzureSoftwareSubscription>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);

    return this._apiService.getAzureSoftwareSubscriptions(queryParam).pipe(
      map(response => new McsMatTableContext(response?.collection,
        response?.totalCollectionCount))
    );
  }
}