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
  CoreRoutes,
  McsAccessControlService,
  McsListviewContext,
  McsListviewDataSource2,
  McsListviewQueryParam,
  McsNavigationService,
  McsTableEvents
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  McsNetworkDnsSummary,
  McsQueryParam,
  McsRouteInfo,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  ComponentHandlerDirective,
  Search
} from '@app/shared';
import {
  compareStrings,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { DnsDetailsService } from './dns-details.service';

type tabGroupType = 'management' | 'zones';

@Component({
  selector: 'mcs-dns-details',
  templateUrl: './dns-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DnsDetailsComponent implements OnInit, OnDestroy {
  public readonly listviewDatasource: McsListviewDataSource2<McsNetworkDnsSummary>;
  public readonly dataEvents: McsTableEvents<McsNetworkDnsSummary>;
  public selectedDns$: Observable<McsNetworkDnsSummary>;
  public selectedTabId$: Observable<string>;

  private _destroySubject = new Subject<void>();
  private _routerHandler: Subscription;

  @ViewChild(ComponentHandlerDirective)
  private _componentHandler: ComponentHandlerDirective;

  public constructor(
    _injector: Injector,
    _translate: TranslateService,
    private _eventDispatcher: EventBusDispatcherService,
    private _activatedRoute: ActivatedRoute,
    private _navigationService: McsNavigationService,
    private _dnsDetailsService: DnsDetailsService,
    private _apiService: McsApiService,
    private _accessControlService: McsAccessControlService,
  ) {
    this.listviewDatasource = new McsListviewDataSource2(
      this._getNetworkDns.bind(this),
      {
        sortPredicate: this._sortDnsPredicate.bind(this),
        panelSettings: {
          inProgressText: _translate.instant('dnsListing.shared.loading'),
          emptyText: _translate.instant('dnsListing.shared.noDns'),
          errorText: _translate.instant('dnsListing.shared.errorMessage')
        }
      }
    );
    this.dataEvents = new McsTableEvents(_injector, this.listviewDatasource, {
      dataChangeEvent: McsEvent.dataChangeDnsDetails as any
    });

    this._registerEvents();
  }

  public ngOnInit() {
    this._subscribeToDnsResolver();
  }

  public ngOnDestroy() {
    this.listviewDatasource.disconnect(null);
    this.dataEvents.dispose();
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._routerHandler);
  }

  public onTabChanged(tab: any) {
    this._navigationService.navigateTo(
      RouteKey.DnsDetails,
      [this._dnsDetailsService.getDnsDetailsId(), tab.id as tabGroupType]
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

  public get selectedDnsId(): string {
    return this._dnsDetailsService.getDnsDetailsId();
  }

  public hasServiceChangeAccess(dns: McsNetworkDnsSummary) {
    return (dns.isPrimary && dns.serviceChangeAvailable) &&
      this._accessControlService.hasPermission([
        'OrderEdit'
      ]);
  }

  public hasRequestChangeAndTicketCreateAccess(dns: McsNetworkDnsSummary) {
    let hasRequestChangeAccess = this.hasServiceChangeAccess(dns);
    let hasTicketCreatePermission = this._accessControlService.hasPermission([
      'TicketCreate'
    ]);
    return hasRequestChangeAccess || hasTicketCreatePermission;
  }

  public onRequestChange(dns: McsNetworkDnsSummary): string {
    return isNullOrEmpty(dns.serviceId) ?
      CoreRoutes.getNavigationPath(RouteKey.OrderHostedDnsChange) :
      `${CoreRoutes.getNavigationPath(RouteKey.OrderHostedDnsChange)}?serviceId=${dns.serviceId}`;
  }

  public onRaiseTicket(dns: McsNetworkDnsSummary): string {
    return isNullOrEmpty(dns.serviceId) ?
      CoreRoutes.getNavigationPath(RouteKey.TicketCreate) :
      `${CoreRoutes.getNavigationPath(RouteKey.TicketCreate)}?serviceId=${dns.serviceId}`;
  }

  private _getNetworkDns(
    param: McsListviewQueryParam
  ): Observable<McsListviewContext<McsNetworkDnsSummary>> {
    let queryParam = new McsQueryParam();
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);

    return this._apiService.getNetworkDns(queryParam).pipe(
      map((networkDns) => {
        return new McsListviewContext<McsNetworkDnsSummary>(networkDns?.collection);
      })
    );
  }

  private _resetManagementState(): void {
    if (!isNullOrEmpty(this._componentHandler)) {
      this._componentHandler.recreateComponent();
    }
  }

  private _subscribeToDnsResolver(): void {
    this.selectedDns$ = this._activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.dns) as McsNetworkDnsSummary),
      tap((dns) => {
        if (isNullOrEmpty(dns)) { return; }
        this._dnsDetailsService.setDnsDetails(dns);
      }),
      shareReplay(1)
    );
  }

  private _sortDnsPredicate(first: McsNetworkDnsSummary, second: McsNetworkDnsSummary): number {
    return compareStrings(first.billingDescription, second.billingDescription);
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
