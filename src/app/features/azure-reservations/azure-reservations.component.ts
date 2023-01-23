import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  ViewChild
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import {
  McsMatTableContext,
  McsMatTableQueryParam,
  McsNavigationService,
  McsPageBase,
  McsTableDataSource2,
  McsTableEvents
} from '@app/core';
import { McsEvent } from '@app/events';
import {
  McsAzureReservation,
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
  addDaysToDate,
  compareDates,
  createObject,
  getCurrentDate,
  getSafeProperty,
  isNullOrEmpty,
  CommonDefinition
} from '@app/utilities';

@Component({
  selector: 'mcs-azure-reservations',
  templateUrl: './azure-reservations.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AzureReservationsComponent extends McsPageBase {

  public get cogIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ELLIPSIS_HORIZONTAL;
  }

  public readonly dataSource: McsTableDataSource2<McsAzureReservation>;
  public readonly dataEvents: McsTableEvents<McsAzureReservation>;
  public readonly defaultColumnFilters: McsFilterInfo[] = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'name' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'productName' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'quantity' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'utilisation' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'type' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'status' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'region' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'commitmentStartDate' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'commitmentEndDate' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'billingFrequency' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'term' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'scope' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'serviceId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'reservationOrderId' }),
    createObject(McsFilterInfo, { value: false, exclude: false, id: 'id' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'action' })
  ];

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService,
    private _navigationService: McsNavigationService
  ) {
    super(_injector);
    this.dataSource = new McsTableDataSource2(this._getAzureReservations.bind(this));
    this.dataEvents = new McsTableEvents(_injector, this.dataSource, {
      dataChangeEvent: McsEvent.dataChangeAzureReservations
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

  @ViewChild('sort')
  public set sort(value: MatSort) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerSort(value);
    }
  }

  public get featureName(): string {
    return 'azureReservations';
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  /**
   * Navigate to create a ticket
   */
  public onRaiseTicket(service: McsAzureReservation): void {
    isNullOrEmpty(service.serviceId) ?
      this._navigationService.navigateTo(RouteKey.TicketCreate) :
      this._navigationService.navigateTo(RouteKey.TicketCreate, [], { queryParams: { serviceId: service.serviceId}});
  }

  /**
   * Returns true if reservation is expiring within 7 days
   */
   public isReservationExpiring(reservation: McsAzureReservation): boolean {
    return (compareDates(reservation.commitmentEndDate, addDaysToDate(getCurrentDate(), 7)) < 1
      && compareDates(reservation.commitmentEndDate, getCurrentDate()) === 1
      && !reservation.autoRenewEnabled);
  }

  private _getAzureReservations(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsAzureReservation>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);
    queryParam.sortDirection = getSafeProperty(param, obj => obj.sort.direction);
    queryParam.sortField = getSafeProperty(param, obj => obj.sort.active);

    return this._apiService.getAzureReservations(queryParam).pipe(
      map(response => {
        return new McsMatTableContext(response?.collection,
        response?.totalCollectionCount)
      })
    );
  }
}
