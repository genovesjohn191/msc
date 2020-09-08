import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
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
  Subscription,
  of
} from 'rxjs';
import {
  takeUntil,
  tap,
  shareReplay,
  map
} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import {
  McsServerPermission,
  McsNavigationService,
  McsListViewListingBase,
  McsErrorHandlerService
} from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  getSafeProperty,
  CommonDefinition,
  compareStrings
} from '@app/utilities';
import { ComponentHandlerDirective } from '@app/shared';
import {
  RouteKey,
  McsServer,
  McsServerPlatform,
  McsApiCollection,
  McsQueryParam,
  McsRouteInfo,
  McsFeatureFlag,
  McsJob,
  JobStatus,
  HttpStatusCode
} from '@app/models';
import { McsApiService } from '@app/services';
import { McsEvent } from '@app/events';
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
export class ServerComponent extends McsListViewListingBase<McsServerGroup> implements OnInit, OnDestroy {
  public server$: Observable<McsServer>;
  public selectedTabId$: Observable<string>;
  public serverPermission: McsServerPermission;

  private _destroySubject = new Subject<void>();
  private _routerHandler: Subscription;
  private _serverDeletedHandler: Subscription;

  @ViewChild(ComponentHandlerDirective, { static: false })
  private _componentHandler: ComponentHandlerDirective;

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    _translate: TranslateService,
    private _activatedRoute: ActivatedRoute,
    private _navigationService: McsNavigationService,
    private _apiService: McsApiService,
    private _serverService: ServerService,
    private _errorHandlerService: McsErrorHandlerService
  ) {
    super(_injector, _changeDetectorRef, {
      dataChangeEvent: McsEvent.dataChangeServers,
      dataAddEvent: McsEvent.entityCreatedEvent,
      dataDeleteEvent: McsEvent.entityDeletedEvent,
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
    this._subscribeToServerResolve();
    this.listViewDatasource.registerSortPredicate(this._sortServerGroupPredicate.bind(this));
  }

  public ngOnDestroy() {
    super.dispose();
    unsubscribeSafely(this._serverDeletedHandler);
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._routerHandler);
  }

  private _onServerDelete(job: McsJob): void {
    let correctServerId: boolean = getSafeProperty(job, (obj) => obj.clientReferenceObject.serverId) === this._serverService.getServerId();
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
  protected getEntityListing(query: McsQueryParam): Observable<McsApiCollection<McsServerGroup>> {
    return this._apiService.getServers(query).pipe(
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

        let serverGroupsCollection = new McsApiCollection<McsServerGroup>();
        serverGroupsCollection.collection = serverGroups;
        serverGroupsCollection.totalCollectionCount = serverGroups.length;
        return serverGroupsCollection;
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
    this._routerHandler = this.eventDispatcher.addEventListener(
      McsEvent.routeChange, (routeInfo: McsRouteInfo) => {
        let tabUrl = routeInfo && routeInfo.urlAfterRedirects;
        tabUrl = getSafeProperty(tabUrl, (obj) => obj.split('/').reduce((_prev, latest) => latest));
        this.selectedTabId$ = of(tabUrl);
      });

    this._serverDeletedHandler = this.eventDispatcher.addEventListener(
      McsEvent.jobServerDelete, this._onServerDelete.bind(this)
    );
  }
}
