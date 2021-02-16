import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  ViewChild } from '@angular/core';
import {
  CoreRoutes,
  McsAccessControlService,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsTableDataSource2,
  McsTableEvents } from '@app/core';
import { Observable } from 'rxjs';
import { McsEvent } from '@app/events';
import {
  McsFilterInfo,
  McsNetworkDnsBase,
  McsQueryParam,
  RouteKey } from '@app/models';
import { McsApiService } from '@app/services';
import {
  CommonDefinition,
  createObject,
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';
import { map } from 'rxjs/operators';
import { ColumnFilter, Paginator, Search } from '@app/shared';
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
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'isPrimary'}),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'serviceId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'zoneCount' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'action' })
  ];

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _translateService: TranslateService,
    private _apiService: McsApiService,
    private _accessControlService: McsAccessControlService,
  ) {
    this.dataSource = new McsTableDataSource2(this._getNetworkDNS.bind(this));
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

  private _getNetworkDNS(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsNetworkDnsBase>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);

    return this._apiService.getNetworkDns(queryParam).pipe(
      map(response => new McsMatTableContext(response?.collection,
        response?.totalCollectionCount))
    );
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

  private _isColumnIncluded(filter: McsFilterInfo): boolean {
    if (filter.id === 'action') {
      return this._accessControlService.hasPermission([
        'OrderEdit',
        'TicketCreate'
      ]);
    }
    return true;
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

}