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
  ChangeDetectorRef,
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
  McsListViewListingBase,
  McsNavigationService
} from '@app/core';
import { McsEvent } from '@app/events';
import {
  McsApiCollection,
  McsNetworkDnsSummary,
  McsQueryParam,
  McsRouteInfo,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import { ComponentHandlerDirective } from '@app/shared';
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
export class DnsDetailsComponent extends McsListViewListingBase<McsNetworkDnsSummary> implements OnInit, OnDestroy {
  public selectedDns$: Observable<McsNetworkDnsSummary>;
  public selectedTabId$: Observable<string>;

  private _destroySubject = new Subject<void>();
  private _routerHandler: Subscription;

  @ViewChild(ComponentHandlerDirective)
  private _componentHandler: ComponentHandlerDirective;

  public constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    _translate: TranslateService,
    private _activatedRoute: ActivatedRoute,
    private _navigationService: McsNavigationService,
    private _dnsDetailsService: DnsDetailsService,
    private _apiService: McsApiService,
    private _accessControlService: McsAccessControlService,
  ) {
    super(_injector, _changeDetectorRef, {
      dataChangeEvent: McsEvent.dataChangeDnsDetails,
      panelSettings: {
        inProgressText: _translate.instant('dnsListing.shared.loading'),
        emptyText: _translate.instant('dnsListing.shared.noDns'),
        errorText: _translate.instant('dnsListing.shared.errorMessage')
      }
    });
    this._registerEvents();
  }

  public ngOnInit() {
    this._subscribeToDnsResolver();
    this.listViewDatasource.registerSortPredicate(this._sortDnsPredicate.bind(this));
  }

  public ngOnDestroy() {
    super.dispose();
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._routerHandler);
  }

  public onTabChanged(tab: any) {
    this._navigationService.navigateTo(
      RouteKey.DnsDetails,
      [this._dnsDetailsService.getDnsDetailsId(), tab.id as tabGroupType]
    );
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

  protected getEntityListing(query: McsQueryParam): Observable<McsApiCollection<McsNetworkDnsSummary>> {
    return this._apiService.getNetworkDns(query);
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
    this._routerHandler = this.eventDispatcher.addEventListener(
      McsEvent.routeChange, (routeInfo: McsRouteInfo) => {
        let tabUrl = routeInfo && routeInfo.urlAfterRedirects;
        tabUrl = getSafeProperty(tabUrl, (obj) => obj.split('/').reduce((_prev, latest) => latest));
        this.selectedTabId$ = of(tabUrl);
      });
  }
}
