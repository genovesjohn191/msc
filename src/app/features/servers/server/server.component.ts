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
  ChangeDetectorRef,
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
  McsErrorHandlerService,
  McsListviewDataSource2,
  McsNavigationService,
  McsServerPermission,
  McsTableEvents
} from '@app/core';
import {
  McsListviewContext,
  McsListviewQueryParam
} from '@app/core/data-access/mcs-listview-datasource2';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  HttpStatusCode,
  JobStatus,
  McsJob,
  McsQueryParam,
  McsRouteInfo,
  McsServer,
  McsServerPlatform,
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

import { ServerService } from './server.service';

// Add another group type in here if you have addition tab
type tabGroupType = 'management' | 'storage';

interface McsServerGroup {
  group: McsServerPlatform;
  servers: McsServer[];
}

@Component({
  selector: 'mcs-server',
  templateUrl: './server.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  }
})
export class ServerComponent implements OnInit, OnDestroy {
  public readonly listviewDatasource: McsListviewDataSource2<McsServerGroup>;
  public readonly dataEvents: McsTableEvents<McsServerGroup>;

  public server$: Observable<McsServer>;
  public selectedTabId$: Observable<string>;
  public serverPermission: McsServerPermission;

  private _destroySubject = new Subject<void>();
  private _routerHandler: Subscription;
  private _serverDeletedHandler: Subscription;

  @ViewChild(ComponentHandlerDirective)
  private _componentHandler: ComponentHandlerDirective;

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    _translate: TranslateService,
    private _activatedRoute: ActivatedRoute,
    private _eventDispatcher: EventBusDispatcherService,
    private _navigationService: McsNavigationService,
    private _apiService: McsApiService,
    private _serverService: ServerService,
    private _errorHandlerService: McsErrorHandlerService
  ) {
    this.listviewDatasource = new McsListviewDataSource2(
      this._getServers.bind(this),
      {
        sortPredicate: this._sortServerGroupPredicate.bind(this),
        panelSettings: {
          inProgressText: _translate.instant('servers.loading'),
          emptyText: _translate.instant('servers.noMedia'),
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
    this._subscribeToServerResolve();
  }

  public ngOnDestroy() {
    this.listviewDatasource.disconnect(null);
    this.dataEvents.dispose();
    unsubscribeSafely(this._serverDeletedHandler);
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._routerHandler);
  }

  @ViewChild('search')
  public set search(value: Search) {
    if (!isNullOrEmpty(value)) {
      this.listviewDatasource.registerSearch(value);
    }
  }

  private _onServerDelete(job: McsJob): void {
    let correctServerId: boolean = getSafeProperty(job,
      (obj) => obj.clientReferenceObject.serverId) === this._serverService.getServerId();
    if (correctServerId && job.status === JobStatus.Completed) {
      this._errorHandlerService.redirectToErrorPage(HttpStatusCode.NotFound);
    }
  }

  public get angleDoubleRightIconKey(): string {
    return CommonDefinition.ASSETS_SVG_NEXT_ARROW;
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  /**
   * Returns the selected server id
   */
  public get selectedServerId(): string {
    return this._serverService.getServerId();
  }

  /**
   * Returns the service ID needed for ticket creation depending on the type of server
   */
  public getTicketCreationServiceId(server: McsServer): string {
    if (server.isSelfManaged) {
      return getSafeProperty(server, (obj) => obj.platform.resourceName, '');
    }
    return server.serviceId;
  }

  /**
   * Event that emits when the tab is changed in the routing tabgroup
   * @param tab Active tab
   */
  public onTabChanged(tab: any) {
    this._navigationService.navigateTo(
      RouteKey.ServerDetails,
      [this._serverService.getServerId(), tab.id as tabGroupType]
    );
  }

  /**
   * Gets the entity listing from API
   */
  private _getServers(param: McsListviewQueryParam): Observable<McsListviewContext<McsServerGroup>> {
    let queryParam = new McsQueryParam();
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);

    return this._apiService.getServers(queryParam).pipe(
      map((servers) => {
        let serverGroups = new Array<McsServerGroup>();
        servers.collection.forEach((server) => {
          let platform = getSafeProperty(server, (obj) => obj.platform);
          let noPlatform = isNullOrEmpty(platform) || isNullOrEmpty(platform.resourceName);
          if (noPlatform) {
            platform = new McsServerPlatform();
            platform.resourceId = null;
            platform.resourceName = 'Others';
          }

          let groupFound = serverGroups.find(
            (serverGroup) => serverGroup.group.resourceName === platform.resourceName
          );
          if (!isNullOrEmpty(groupFound)) {
            groupFound.servers.push(server);
            return;
          }
          serverGroups.push({
            group: platform,
            servers: [server]
          });
        });
        return new McsListviewContext<McsServerGroup>(serverGroups);
      })
    );
  }


  /**
   * Resets the management state
   */
  private _resetManagementState(): void {
    if (!isNullOrEmpty(this._componentHandler)) {
      this._componentHandler.recreateComponent();
    }
  }

  /**
   * Subcribes to server resolve
   */
  private _subscribeToServerResolve(): void {
    this.server$ = this._activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.server)),
      tap((server) => {
        if (isNullOrEmpty(server)) { return; }
        this._serverService.setServerDetails(server);
        this.serverPermission = new McsServerPermission(server);
      }),
      shareReplay(1)
    );
  }

  /**
   * Subcribes to parameter change
   */
  private _subscribeToParamChange(): void {
    this._activatedRoute.paramMap.pipe(
      takeUntil(this._destroySubject),
      tap((params: ParamMap) => {
        let serverId = params.get('id');
        if (isNullOrEmpty(serverId)) { return; }

        this._resetManagementState();
        this._serverService.setServerId(serverId);
      })
    ).subscribe();
  }

  /**
   * Sorting predicate for group
   */
  private _sortServerGroupPredicate(first: McsServerGroup, second: McsServerGroup): number {
    return compareStrings(first.group.resourceName, second.group.resourceName);
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

    this._serverDeletedHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobServerDelete, this._onServerDelete.bind(this)
    );
  }
}
