import {
  of,
  Observable,
  Subject,
  Subscription
} from 'rxjs';
import {
  map,
  shareReplay,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  McsAccessControlService,
  McsListviewContext,
  McsListviewDataSource2,
  McsListviewQueryParam,
  McsNavigationService
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  McsNetworkDnsZone,
  McsNetworkDnsZoneBase,
  McsQueryParam,
  McsRouteInfo,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import { Search } from '@app/shared';
import {
  compareStrings,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';
import { DnsZoneDetailsService } from './dns-zone.service';

type tabGroupType = 'overview' | 'records';

interface McsZonesGroup {
  group: {
    serviceId: string,
    billingDescription: string,
    id: string
  };
  zones: McsNetworkDnsZoneBase[];
}

@Component({
  selector: 'mcs-dns-zone',
  templateUrl: './dns-zone.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DnsZoneComponent implements OnInit, OnDestroy {
  public readonly listviewDatasource: McsListviewDataSource2<McsZonesGroup>;

  public selectedDnsZone$: Observable<McsNetworkDnsZone>;
  public selectedTabId$: Observable<string>;

  private _destroySubject = new Subject<void>();
  private _routerHandler: Subscription;

  public constructor(
    _injector: Injector,
    _translate: TranslateService,
    private _accessControlService: McsAccessControlService,
    private _activatedRoute: ActivatedRoute,
    private _apiService: McsApiService,
    private _dnsZoneDetailsService: DnsZoneDetailsService,
    private _eventDispatcher: EventBusDispatcherService,
    private _navigationService: McsNavigationService
  ) {
    this.listviewDatasource = new McsListviewDataSource2(
      this._getNetworkDnsZones.bind(this),
      {
        sortPredicate: this._sortDnsPredicate.bind(this),
        panelSettings: {
          inProgressText: _translate.instant('dns.loading'),
          emptyText: _translate.instant('dns.noRecordsFoundMessage'),
          errorText: _translate.instant('dns.zoneErrorMessage')
        }
      }
    );

    this._registerEvents();
  }

  public ngOnInit() {
    this._subscribeToDnsResolver();
  }

  public ngOnDestroy() {
    this.listviewDatasource.disconnect(null);
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._routerHandler);
  }

  public onTabChanged(tab: any) {
    this._navigationService.navigateTo(
      RouteKey.DnsZoneDetails,
      [this._dnsZoneDetailsService.getDnsZoneDetailsId(), tab.id as tabGroupType]
    );
  }

  @ViewChild('search')
  public set search(value: Search) {
    if (!isNullOrEmpty(value)) {
      this.listviewDatasource.registerSearch(value);
    }
  }

  public get cogIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ELLIPSIS_HORIZONTAL;
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public hasServiceChangeAccess(dns: McsNetworkDnsZone) {
    return dns.parentServiceChangeAvailable &&
      this._accessControlService.hasPermission([
        'OrderEdit'
      ]);
  }

  public actionsEnabled(dns: McsNetworkDnsZone) {
    let hasRequestChangeAccess = this.hasServiceChangeAccess(dns);
    let hasTicketCreatePermission = this._accessControlService.hasPermission([
      'TicketCreate'
    ]);
    return hasRequestChangeAccess || hasTicketCreatePermission;
  }

  public onRequestChange(dns: McsNetworkDnsZone): void {
    this._navigationService.navigateTo(RouteKey.OrderHostedDnsChange, [], {
      queryParams: {
        serviceId: dns.parentServiceId,
        zoneName: dns.name
      }
    });
  }

  public onRaiseTicket(dns: McsNetworkDnsZone): void {
    this._navigationService.navigateTo(RouteKey.TicketCreate, [], {
      queryParams: {
        serviceId: dns.parentServiceId
      }
    });
  }

  private _getNetworkDnsZones(
    param: McsListviewQueryParam
  ): Observable<McsListviewContext<McsZonesGroup>> {
    let queryParam = new McsQueryParam();
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);

    return this._apiService.getNetworkDnsZones(queryParam).pipe(
      map((zones) => {
        let zoneGroups = new Array<McsZonesGroup>();
        zones.collection.forEach((zone) => {
          let parentServiceId = getSafeProperty(zone, (obj) => obj.parentServiceId) || 'Unknown';
          let groupFound = zoneGroups.find((zoneGroup) => zoneGroup?.group?.serviceId === parentServiceId);
          if (!isNullOrEmpty(groupFound)) {
            groupFound.zones.push(zone);
            return;
          }
          zoneGroups.push({
            group: {
              serviceId: parentServiceId,
              billingDescription: zone.parentBillingDescription,
              id: zone.parentUuid
            },
            zones: [zone]
          });
        });
        return new McsListviewContext<McsZonesGroup>(zoneGroups);
      })
    );
  }

  private _subscribeToDnsResolver(): void {
    this.selectedDnsZone$ = this._activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.dns) as McsNetworkDnsZone),
      tap((dns) => {
        if (isNullOrEmpty(dns)) { return; }
        this._dnsZoneDetailsService.setDnsZoneDetails(dns);
      }),
      shareReplay(1)
    );
  }

  private _sortDnsPredicate(first: McsZonesGroup, second: McsZonesGroup): number {
    return compareStrings(first.group.billingDescription, second.group.billingDescription);
  }

  private _registerEvents(): void {
    this._routerHandler = this._eventDispatcher.addEventListener(
      McsEvent.routeChange, (routeInfo: McsRouteInfo) => {
        let tabUrl = routeInfo && routeInfo.urlAfterRedirects;
        tabUrl = getSafeProperty(tabUrl, (obj) => obj.split('/').reduce((_prev, latest) => latest));
        this.selectedTabId$ = of(tabUrl);
      });
  }
}
