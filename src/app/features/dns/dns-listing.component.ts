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
  CoreRoutes,
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
  McsNetworkDnsBase,
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
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'mcs-dns-listing',
  templateUrl: './dns-listing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DnsListingComponent extends McsPageBase {
  public readonly dataSource: McsTableDataSource2<McsNetworkDnsBase>;
  public readonly dataEvents: McsTableEvents<McsNetworkDnsBase>;
  public readonly filterPredicate = this._isColumnIncluded.bind(this);
  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'billingDescription' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'isPrimary' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'serviceId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'zoneCount' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'action' })
  ];

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _translateService: TranslateService,
    private _navigationService: McsNavigationService,
    private _apiService: McsApiService,
    private _accessControlService: McsAccessControlService,
  ) {
    super(_injector);
    this.dataSource = new McsTableDataSource2<McsNetworkDnsBase>(this._getNetworkDNS.bind(this))
      .registerConfiguration(new McsMatTableConfig(true));

    this.dataEvents = new McsTableEvents(_injector, this.dataSource, {
      dataChangeEvent: McsEvent.dataChangeDnsListing
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
    return 'dnsListing';
  }

  public get cogIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ELLIPSIS_HORIZONTAL;
  }

  public get unavailableText(): string {
    return this._translateService.instant('dnsListing.unavailable');;
  }

  public onRequestChange(dns: McsNetworkDnsBase): void {
    if (isNullOrEmpty(dns.serviceId)) {
      this._navigationService.navigateTo(RouteKey.OrderHostedDnsChange)
    }
    this._navigationService.navigateTo(RouteKey.OrderHostedDnsChange, [], {
      queryParams: { serviceId: dns.serviceId }
    });
  }

  public onRaiseTicket(dns: McsNetworkDnsBase): void {
    if (isNullOrEmpty(dns.serviceId)) {
      this._navigationService.navigateTo(RouteKey.TicketCreate)
    }
    this._navigationService.navigateTo(RouteKey.TicketCreate, [], {
      queryParams: { serviceId: dns.serviceId }
    });
  }

  public isPrimary(isPrimaryDns: boolean): string {
    return (isPrimaryDns) ? 'Primary' : 'Secondary';
  }

  public hasServiceChangeAccess(dns: McsNetworkDnsBase) {
    return (dns.isPrimary && dns.serviceChangeAvailable) &&
      this._accessControlService.hasPermission([
        'OrderEdit'
      ]);
  }

  public actionsEnabled(dns: McsNetworkDnsBase) {
    let hasRequestChangeAccess = this.hasServiceChangeAccess(dns);
    let hasTicketCreatePermission = this._accessControlService.hasPermission([
      'TicketCreate'
    ]);
    return hasRequestChangeAccess || hasTicketCreatePermission;
  }

  public navigateToDNSDetails(dns: McsNetworkDnsBase) {
    if (isNullOrEmpty(dns)) { return; }
    this._navigationService.navigateTo(RouteKey.DnsDetails, [dns.id]);
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

  private _getNetworkDNS(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsNetworkDnsBase>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);
    queryParam.sortDirection = getSafeProperty(param, obj => obj.sort.direction);
    queryParam.sortField = getSafeProperty(param, obj => obj.sort.active);

    return this._apiService.getNetworkDns(queryParam).pipe(
      map(response => {
        return new McsMatTableContext(response?.collection,
        response?.totalCollectionCount)
      })
    );
  }
}
