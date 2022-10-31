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
  McsAccessControlService,
  McsMatTableConfig,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsNavigationService,
  McsPageBase,
  McsTableDataSource2,
  McsTableEvents
} from '@app/core';
import { McsEvent } from '@app/events';
import {
  McsFilterInfo,
  McsNetworkDnsZoneBase,
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
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  CommonDefinition
} from '@app/utilities';

@Component({
  selector: 'mcs-dns-listing',
  templateUrl: './dns-listing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DnsListingComponent extends McsPageBase {
  public readonly dataSource: McsTableDataSource2<McsNetworkDnsZoneBase>;
  public readonly dataEvents: McsTableEvents<McsNetworkDnsZoneBase>;
  public readonly filterPredicate = this._isColumnIncluded.bind(this);
  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'name' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'records' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'serviceId' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'action' })
  ];

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _accessControlService: McsAccessControlService,
    private _apiService: McsApiService,
    private _navigationService: McsNavigationService
  ) {
    super(_injector);
    this.dataSource = new McsTableDataSource2<McsNetworkDnsZoneBase>(this._getNetworkDnsZones.bind(this))
      .registerConfiguration(new McsMatTableConfig(true));

    this.dataEvents = new McsTableEvents(_injector, this.dataSource, {
      dataChangeEvent: McsEvent.dataChangeDnsZoneListing
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
    return 'dns';
  }

  public get cogIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ELLIPSIS_HORIZONTAL;
  }

  public hasServiceChangeAccess(dns: McsNetworkDnsZoneBase) {
    return (dns.parentServiceChangeAvailable) &&
      this._accessControlService.hasPermission([
        'OrderEdit'
      ]);
  }

  public actionsEnabled(dns: McsNetworkDnsZoneBase) {
    let hasRequestChangeAccess = this.hasServiceChangeAccess(dns);
    let hasTicketCreatePermission = this._accessControlService.hasPermission([
      'TicketCreate'
    ]);
    return hasRequestChangeAccess || hasTicketCreatePermission;
  }

  public onRequestChange(dns: McsNetworkDnsZoneBase): void {
    this._navigationService.navigateTo(RouteKey.OrderHostedDnsChange, [], {
      queryParams: {
        serviceId: dns.parentServiceId,
        zoneName: dns.name
      }
    });
  }

  public onRaiseTicket(dns: McsNetworkDnsZoneBase): void {
    this._navigationService.navigateTo(RouteKey.TicketCreate, [], {
      queryParams: { serviceId: dns.parentServiceId }
    });
  }

  public navigateToDnsZoneDetails(dns: McsNetworkDnsZoneBase) {
    if (isNullOrEmpty(dns)) { return; }
    this._navigationService.navigateTo(RouteKey.DnsZoneDetails, [dns.id]);
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  private _isColumnIncluded(filter: McsFilterInfo): boolean {
    if (filter.id === 'action') {
      return this._accessControlService.hasPermission([
        'OrderEdit',
        'TicketCreate'
      ]);
    }
    return true;
  }

  private _getNetworkDnsZones(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsNetworkDnsZoneBase>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);
    queryParam.sortDirection = getSafeProperty(param, obj => obj.sort.direction);
    queryParam.sortField = getSafeProperty(param, obj => obj.sort.active);

    return this._apiService.getNetworkDnsZones(queryParam).pipe(
      map(response => {
        return new McsMatTableContext(response?.collection,
        response?.totalCollectionCount)
      })
    );
  }
}
