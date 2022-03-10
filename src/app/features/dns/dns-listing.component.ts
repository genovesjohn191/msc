import {
  Observable,
  throwError
} from 'rxjs';
import {
  catchError,
  map
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  ViewChild
} from '@angular/core';
import { Sort } from '@angular/material/sort';

import {
  CoreRoutes,
  McsAccessControlService,
  McsMatTableConfig,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsNavigationService,
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
export class DnsListingComponent {
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

  public isSorting: boolean;

  private _sortDirection: string;
  private _sortField: string;

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _translateService: TranslateService,
    private _navigationService: McsNavigationService,
    private _apiService: McsApiService,
    private _accessControlService: McsAccessControlService,
  ) {
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

  public get cogIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ELLIPSIS_HORIZONTAL;
  }

  public get unavailableText(): string {
    return this._translateService.instant('dnsListing.unavailable');;
  }

  public onRequestChange(dns: McsNetworkDnsBase): string {
    return isNullOrEmpty(dns.serviceId) ?
      CoreRoutes.getNavigationPath(RouteKey.OrderHostedDnsChange) :
      `${CoreRoutes.getNavigationPath(RouteKey.OrderHostedDnsChange)}?serviceId=${dns.serviceId}`;
  }

  public onRaiseTicket(dns: McsNetworkDnsBase): string {
    return isNullOrEmpty(dns.serviceId) ?
      CoreRoutes.getNavigationPath(RouteKey.TicketCreate) :
      `${CoreRoutes.getNavigationPath(RouteKey.TicketCreate)}?serviceId=${dns.serviceId}`;
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

  public onSortChange(sortState: Sort) {
    this.isSorting = true;
    this._sortDirection = sortState.direction;
    this._sortField = sortState.active;
    this.retryDatasource();
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
    queryParam.sortDirection = this._sortDirection;
    queryParam.sortField = this._sortField;

    return this._apiService.getNetworkDns(queryParam).pipe(
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
}
