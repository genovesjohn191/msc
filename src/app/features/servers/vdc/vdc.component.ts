import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Injector,
  ViewChild
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
  compareStrings
} from '@app/utilities';
import {
  McsResource,
  RouteKey,
  McsServer,
  McsServerPlatform,
  McsQueryParam,
  McsApiCollection,
  McsRouteInfo
} from '@app/models';
import { McsApiService } from '@app/services';
import { McsEvent } from '@app/events';
import { ComponentHandlerDirective } from '@app/shared';
import { VdcService } from './vdc.service';

// Add another group type in here if you have addition tab
type tabGroupType = 'overview';

interface McsVdcGroup {
  group: McsServerPlatform;
  servers: McsServer[];
}

@Component({
  selector: 'mcs-vdc',
  templateUrl: './vdc.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  }
})
export class VdcComponent extends McsListViewListingBase<McsVdcGroup> implements OnInit, OnDestroy {
  public selectedResource$: Observable<McsResource>;
  public selectedTabId$: Observable<string>;

  private _destroySubject = new Subject<void>();
  private _routerHandler: Subscription;

  @ViewChild(ComponentHandlerDirective, { static: false })
  private _componentHandler: ComponentHandlerDirective;

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    _translate: TranslateService,
    private _activatedRoute: ActivatedRoute,
    private _navigationService: McsNavigationService,
    private _apiService: McsApiService,
    private _vdcService: VdcService
  ) {
    super(_injector, _changeDetectorRef, {
      dataChangeEvent: McsEvent.dataChangeServers,
      panelSettings: {
        inProgressText: _translate.instant('servers.loading'),
        emptyText: _translate.instant('servers.noServers'),
        errorText: _translate.instant('servers.errorMessage')
      }
    });
    this._registerEvents();
  }

  public ngOnInit() {
    this._subscribeToParamChange();
    this._subscribeToVdcResolve();
    this.listViewDatasource.registerSortPredicate(this._sortVdcGroupPredicate.bind(this));
  }

  public ngOnDestroy() {
    super.dispose();
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._routerHandler);
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
      RouteKey.VdcDetails,
      [this._vdcService.getResourceId(), tab.id as tabGroupType]
    );
  }


  /**
   * Gets the entity listing from API
   */
  protected getEntityListing(query: McsQueryParam): Observable<McsApiCollection<McsVdcGroup>> {
    return this._apiService.getServers(query).pipe(
      map((servers) => {
        let vdcGroups = new Array<McsVdcGroup>();
        servers.collection.forEach((server) => {
          let platform = getSafeProperty(server, (obj) => obj.platform);
          let noPlatform = isNullOrEmpty(platform) || isNullOrEmpty(platform.resourceName);
          if (noPlatform) {
            platform = new McsServerPlatform();
            platform.resourceId = null;
            platform.resourceName = 'Others';
          }

          let groupFound = vdcGroups.find(
            (serverGroup) => serverGroup.group.resourceName === platform.resourceName
          );
          if (!isNullOrEmpty(groupFound)) {
            groupFound.servers.push(server);
            return;
          }
          vdcGroups.push({
            group: platform,
            servers: [server]
          });
        });

        let serverGroupsCollection = new McsApiCollection<McsVdcGroup>();
        serverGroupsCollection.collection = vdcGroups;
        serverGroupsCollection.totalCollectionCount = vdcGroups.length;
        return serverGroupsCollection;
      })
    );
  }

  /**
   * Subcribes to parameter change
   */
  private _subscribeToParamChange(): void {
    this._activatedRoute.paramMap.pipe(
      takeUntil(this._destroySubject),
      tap((params: ParamMap) => {
        let resourceId = params.get('id');
        if (isNullOrEmpty(resourceId)) { return; }

        this._resetOverviewState();
        this._vdcService.setResourceId(resourceId);
      })
    ).subscribe();
  }

  /**
   * Subcribes to VDC resolve
   */
  private _subscribeToVdcResolve(): void {
    this.selectedResource$ = this._activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.vdc)),
      tap((vdc) => {
        if (isNullOrEmpty(vdc)) { return; }
        this._vdcService.setResourceDetails(vdc);
      }),
      shareReplay(1)
    );
  }

  /**
   * Sorting predicate for group
   */
  private _sortVdcGroupPredicate(first: McsVdcGroup, second: McsVdcGroup): number {
    return compareStrings(first.group.resourceName, second.group.resourceName);
  }

  /**
   * Resets overview state
   */
  private _resetOverviewState(): void {
    if (!isNullOrEmpty(this._componentHandler)) {
      this._componentHandler.recreateComponent();
    }
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
