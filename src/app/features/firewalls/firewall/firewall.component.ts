import {
  of,
  Observable,
  Subject,
  Subscription
} from 'rxjs';
import {
  map,
  shareReplay,
  takeUntil,
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
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import {
  McsListviewContext,
  McsListviewDataSource2,
  McsListviewQueryParam,
  McsNavigationService,
  McsTableEvents
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  McsFirewall,
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

import { FirewallService } from './firewall.service';

// Add another group type in here if you have addition tab
type tabGroupType = 'overview' | 'policies';

interface McsFirewallGroup {
  groupName: string;
  firewalls: McsFirewall[];
}

@Component({
  selector: 'mcs-firewall',
  templateUrl: './firewall.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  }
})
export class FirewallComponent implements OnInit, OnDestroy {
  public readonly listviewDatasource: McsListviewDataSource2<McsFirewallGroup>;
  public readonly dataEvents: McsTableEvents<McsFirewallGroup>;
  public selectedFirewall$: Observable<McsFirewall>;
  public selectedTabId$: Observable<string>;

  private _destroySubject = new Subject<void>();
  private _routerHandler: Subscription;

  constructor(
    _injector: Injector,
    _translate: TranslateService,
    private _eventDispatcher: EventBusDispatcherService,
    private _activatedRoute: ActivatedRoute,
    private _navigationService: McsNavigationService,
    private _apiService: McsApiService,
    private _firewallService: FirewallService
  ) {
    this.listviewDatasource = new McsListviewDataSource2(
      this._getFirewalls.bind(this),
      {
        sortPredicate: this._sortFirewallGroupPredicate.bind(this),
        panelSettings: {
          inProgressText: _translate.instant('firewalls.loading'),
          emptyText: _translate.instant('firewalls.noFirewalls'),
          errorText: _translate.instant('firewalls.errorMessage')
        }
      }
    );
    this.dataEvents = new McsTableEvents(_injector, this.listviewDatasource, {
      dataChangeEvent: McsEvent.dataChangeServers as any
    });
    this._registerEvents();
  }

  public ngOnInit() {
    this._subscribeToParamChange();
    this._subscribeToFirewallResolve();
  }

  public ngOnDestroy() {
    this.listviewDatasource.disconnect(null);
    this.dataEvents.dispose();
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._routerHandler);
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

  /**
   * Event that emits when the tab is changed in the routing tabgroup
   * @param tab Active tab
   */
  public onTabChanged(tab: any): void {
    this._navigationService.navigateTo(
      RouteKey.FirewallDetails,
      [this._firewallService.getFirewallId(), tab.id as tabGroupType]
    );
  }

  /**
   * Subcribes to parameter change
   */
  private _subscribeToParamChange(): void {
    this._activatedRoute.paramMap.pipe(
      takeUntil(this._destroySubject),
      tap((params: ParamMap) => {
        let firewallId = params.get('id');
        if (isNullOrEmpty(firewallId)) { return; }

        this._firewallService.setFirewallId(firewallId);
      })
    ).subscribe();
  }

  /**
   * Gets the entity listing from API
   */
  private _getFirewalls(param: McsListviewQueryParam): Observable<McsListviewContext<McsFirewallGroup>> {
    let queryParam = new McsQueryParam();
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);

    return this._apiService.getFirewalls(queryParam).pipe(
      map((firewalls) => {
        let firewallGroups = new Array<McsFirewallGroup>();
        firewalls.collection.forEach((firewall) => {
          let haGroupName = getSafeProperty(firewall, (obj) => obj.haGroupName);
          let groupFound = firewallGroups.find((mediaGroup) => mediaGroup.groupName === haGroupName);
          if (!isNullOrEmpty(groupFound)) {
            groupFound.firewalls.push(firewall);
            return;
          }
          firewallGroups.push({
            groupName: haGroupName,
            firewalls: [firewall]
          });
        });
        return new McsListviewContext<McsFirewallGroup>(firewallGroups);
      })
    );
  }

  /**
   * Subcribes to firewall resolve
   */
  private _subscribeToFirewallResolve(): void {
    this.selectedFirewall$ = this._activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.firewall)),
      tap((firewall) => this._firewallService.setSelectedFirewall(firewall)),
      shareReplay(1)
    );
  }

  /**
   * Sorting predicate for group
   */
  private _sortFirewallGroupPredicate(first: McsFirewallGroup, second: McsFirewallGroup): number {
    return compareStrings(first.groupName, second.groupName);
  }

  /**
   * Register Event dispatchers
   */
  private _registerEvents(): void {
    this._routerHandler = this._eventDispatcher.addEventListener(
      McsEvent.routeChange, (routeInfo: McsRouteInfo) => {
        let tabUrl = routeInfo && routeInfo.urlAfterRedirects;
        tabUrl = getSafeProperty(tabUrl, (obj) => obj.split('/').reduce((_prev, latest) => latest));
        this.selectedTabId$ = of(tabUrl);
      });
  }
}
