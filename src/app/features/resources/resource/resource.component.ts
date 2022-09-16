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
  McsQueryParam,
  McsResource,
  McsRouteInfo,
  McsServer,
  McsServerPlatform,
  PlatformType,
  RouteKey,
  ServiceType
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  ComponentHandlerDirective,
  Search
} from '@app/shared';
import {
  CommonDefinition,
  compareStrings,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { ResourceService } from './resource.service';

// Add another group type in here if you have addition tab
type tabGroupType = 'overview';

interface McsVdcGroup {
  group: McsServerPlatform;
  servers: McsServer[];
}

@Component({
  selector: 'mcs-resource',
  templateUrl: './resource.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  }
})
export class ResourceComponent implements OnInit, OnDestroy {
  public readonly listviewDatasource: McsListviewDataSource2<McsVdcGroup>;
  public readonly dataEvents: McsTableEvents<McsVdcGroup>;
  public selectedResource$: Observable<McsResource>;
  public selectedTabId$: Observable<string>;

  private _destroySubject = new Subject<void>();
  private _routerHandler: Subscription;

  @ViewChild(ComponentHandlerDirective)
  private _componentHandler: ComponentHandlerDirective;

  constructor(
    _injector: Injector,
    _translate: TranslateService,
    private _eventDispatcher: EventBusDispatcherService,
    private _activatedRoute: ActivatedRoute,
    private _navigationService: McsNavigationService,
    private _apiService: McsApiService,
    private _resourceService: ResourceService
  ) {
    this.listviewDatasource = new McsListviewDataSource2(
      this._getVdcGroups.bind(this),
      {
        sortPredicate: this._sortVdcGroupPredicate.bind(this),
        panelSettings: {
          inProgressText: _translate.instant('servers.loading'),
          emptyText: _translate.instant('servers.noServers'),
          errorText: _translate.instant('servers.errorMessage')
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
    this._subscribeToResourceResolve();
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

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public get cogIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ELLIPSIS_HORIZONTAL;
  }

  /**
   * Event that emits when the tab is changed in the routing tabgroup
   * @param tab Active tab
   */
  public onTabChanged(tab: any): void {
    this._navigationService.navigateTo(
      RouteKey.ResourceDetails,
      [this._resourceService.getResourceId(), tab.id as tabGroupType]
    );
  }

  public isResourceTypeVCloud(resource: McsResource): boolean {
    return resource.platform === PlatformType.VCloud;
  }

  public isResourceTypeVCenter(resource: McsResource): boolean {
    return resource.platform === PlatformType.VCenter;
  }

  public isResourceManaged(resource: McsResource): boolean {
    return resource.serviceType === ServiceType.Managed;
  }

  public validToShowContextMenuItems(resource: McsResource): boolean {
    return !isNullOrEmpty(resource.portalUrl) || this.metExpectedPropertyValues(resource);
  }

  public metExpectedPropertyValues(resource: McsResource): boolean {
    return resource.serviceChangeAvailable && !isNullOrEmpty(resource.serviceId);
  }

  public navigateToResource(resource: McsResource): void {
    if (isNullOrEmpty(resource)) { return; }
    this._navigationService.navigateTo(RouteKey.ResourceDetails, [resource.id]);
  }

  public navigateToScaleVdc(serviceId: string): void {
    this._navigationService.navigateTo(RouteKey.OrderVdcScale, [],
      { queryParams: {
        serviceId: serviceId
      }});
  }

  public navigateToExpandVdcStorage(resourceId: string): void {
    this._navigationService.navigateTo(RouteKey.OrderVdcStorageExpand, [],
      { queryParams: {
        resourceId: resourceId
      }});
  }

  /**
   * Gets the entity listing from API
   */
   private _getVdcGroups(param: McsListviewQueryParam): Observable<McsListviewContext<McsVdcGroup>> {
    let queryParam = new McsQueryParam();
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);

    return this._apiService.getServers(queryParam).pipe(
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
        return new McsListviewContext<McsVdcGroup>(vdcGroups);
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
        this._resourceService.setResourceId(resourceId);
      })
    ).subscribe();
  }

  /**
   * Subcribes to resource resolve
   */
  private _subscribeToResourceResolve(): void {
    this.selectedResource$ = this._activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.resource)),
      tap((resource) => {
        if (isNullOrEmpty(resource)) { return; }
        this._resourceService.setResourceDetails(resource);
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
    this._routerHandler = this._eventDispatcher.addEventListener(
      McsEvent.routeChange, (routeInfo: McsRouteInfo) => {
        let tabUrl = routeInfo && routeInfo.urlAfterRedirects;
        tabUrl = getSafeProperty(tabUrl, (obj) => obj.split('/').reduce((_prev, latest) => latest));
        this.selectedTabId$ = of(tabUrl);
      });
  }
}
