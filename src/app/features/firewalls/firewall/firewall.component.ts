import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Injector
} from '@angular/core';
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import {
  Subject,
  Observable,
  of,
  Subscription
} from 'rxjs';
import {
  takeUntil,
  tap,
  shareReplay,
  map
} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import {
  McsNavigationService,
  McsListViewListingBase
} from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  getSafeProperty,
  CommonDefinition,
  compareStrings
} from '@app/utilities';
import {
  RouteKey,
  McsFirewall,
  McsQueryParam,
  McsApiCollection,
  McsRouteInfo
} from '@app/models';
import { McsApiService } from '@app/services';
import { McsEvent } from '@app/events';
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
export class FirewallComponent extends McsListViewListingBase<McsFirewallGroup> implements OnInit, OnDestroy {
  public selectedFirewall$: Observable<McsFirewall>;
  public selectedTabId$: Observable<string>;

  private _destroySubject = new Subject<void>();
  private _routerHandler: Subscription;

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    _translate: TranslateService,
    private _activatedRoute: ActivatedRoute,
    private _navigationService: McsNavigationService,
    private _apiService: McsApiService,
    private _firewallService: FirewallService
  ) {
    super(_injector, _changeDetectorRef, {
      dataChangeEvent: McsEvent.dataChangeServers,
      panelSettings: {
        inProgressText: _translate.instant('firewalls.loading'),
        emptyText: _translate.instant('firewalls.noFirewalls'),
        errorText: _translate.instant('firewalls.errorMessage')
      }
    });
    this._registerEvents();
  }

  public ngOnInit() {
    this._subscribeToParamChange();
    this._subscribeToFirewallResolve();
    this.listViewDatasource.registerSortPredicate(this._sortFirewallGroupPredicate.bind(this));
  }

  public ngOnDestroy() {
    super.dispose();
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._routerHandler);
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
  protected getEntityListing(query: McsQueryParam): Observable<McsApiCollection<McsFirewallGroup>> {
    return this._apiService.getFirewalls(query).pipe(
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

        let firewallGroupsCollection = new McsApiCollection<McsFirewallGroup>();
        firewallGroupsCollection.collection = firewallGroups;
        firewallGroupsCollection.totalCollectionCount = firewallGroups.length;
        return firewallGroupsCollection;
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
    this._routerHandler = this.eventDispatcher.addEventListener(
      McsEvent.routeChange, (routeInfo: McsRouteInfo) =>
      this.selectedTabId$ = of(routeInfo && routeInfo.routePath)
    );
  }
}
