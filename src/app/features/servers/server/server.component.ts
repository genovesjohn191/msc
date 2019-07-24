import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import {
  Subject,
  throwError,
  Observable,
  Subscription
} from 'rxjs';
import {
  startWith,
  takeUntil,
  catchError,
  tap,
  shareReplay,
  map
} from 'rxjs/operators';
import {
  CoreDefinition,
  McsRoutingTabBase,
  McsDataStatusFactory,
  CoreRoutes,
  McsServerPermission
} from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  getSafeProperty
} from '@app/utilities';
import {
  Search,
  ComponentHandlerDirective
} from '@app/shared';
import {
  RouteKey,
  McsServer,
  McsServerPlatform
} from '@app/models';
import { McsApiService } from '@app/services';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/event-manager';
import { ServerService } from './server.service';
import { ServersListSource } from '../servers.listsource';

// Add another group type in here if you have addition tab
type tabGroupType = 'management' | 'storage';

@Component({
  selector: 'mcs-server',
  templateUrl: './server.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  }
})
export class ServerComponent
  extends McsRoutingTabBase<tabGroupType>
  implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('search')
  public search: Search;

  public serverPermission: McsServerPermission;
  public server$: Observable<McsServer>;
  public serversMap$: Observable<Map<string, McsServer[]>>;
  public serverListSource: ServersListSource | null;
  public listStatusFactory: McsDataStatusFactory<Map<string, McsServer[]>>;

  @ViewChild(ComponentHandlerDirective)
  private _componentHandler: ComponentHandlerDirective;

  private _destroySubject = new Subject<void>();
  private _resourcesKeyMap: Map<string, McsServerPlatform>;
  private _serversDataChangeHandler: Subscription;

  constructor(
    _eventDispatcher: EventBusDispatcherService,
    _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _apiService: McsApiService,
    private _serverService: ServerService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_eventDispatcher, _activatedRoute);
    this._resourcesKeyMap = new Map();
    this.listStatusFactory = new McsDataStatusFactory(this._changeDetectorRef);
    this._registerDataEvents();
  }

  public ngOnInit() {
    super.onInit();
    this._subscribeToServerResolve();
  }

  public ngAfterViewInit() {
    Promise.resolve().then(() => {
      this.search.searchChangedStream.pipe(
        startWith(null),
        takeUntil(this._destroySubject)
      ).subscribe(() => this.listStatusFactory.setInProgress());
      this._initializeListsource();
    });
  }

  public ngOnDestroy() {
    super.onDestroy();
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._serversDataChangeHandler);
  }

  public get angleDoubleRightIconKey(): string {
    return CoreDefinition.ASSETS_SVG_NEXT_ARROW;
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
   * Event that emits when the tab is changed in the routing tabgroup
   * @param tab Active tab
   */
  protected onTabChanged(tab: any) {
    this._router.navigate([
      CoreRoutes.getNavigationPath(RouteKey.ServerDetails),
      this.paramId,
      tab.id
    ]);
  }

  /**
   * Event that emits when the parameter id is changed
   * @param id Id of the parameter
   */
  protected onParamIdChanged(id: string) {
    if (isNullOrEmpty(id)) { return; }
    this._resetManagementState();
    this._serverService.setServerId(id);
    this._changeDetectorRef.markForCheck();
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
   * Initialize list source
   */
  private _initializeListsource(): void {
    this.serverListSource = new ServersListSource(this._apiService, this.search);

    // Key function pointer for mapping objects
    let keyFn = (item: McsServer) => {
      let resourceName = isNullOrEmpty(item.platform) ? 'Others' : item.platform.resourceName;
      let resource: McsServerPlatform = this._resourcesKeyMap.get(resourceName);
      if (isNullOrEmpty(resource)) {
        let resourceInstance = new McsServerPlatform();
        resourceInstance.resourceName = 'Others';
        resource = !isNullOrEmpty(item.platform.resourceName) ? item.platform : resourceInstance;
      }
      this._resourcesKeyMap.set(resourceName, resource);
      return resource;
    };

    // Listen to all records changed
    this.serversMap$ = this.serverListSource.findAllRecordsMapStream(keyFn).pipe(
      catchError((error) => {
        this.listStatusFactory.setError();
        return throwError(error);
      }),
      tap((response) => {
        this.search.showLoading(false);
        this.listStatusFactory.setSuccessful(response);
      })
    );
  }

  /**
   * Subcribes to server resolve
   */
  private _subscribeToServerResolve(): void {
    this.server$ = this.activatedRoute.data.pipe(
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
   * Registers the data events
   */
  private _registerDataEvents(): void {
    this._serversDataChangeHandler = this.eventDispatcher.addEventListener(
      McsEvent.dataChangeServers, this._onServersDataChanged.bind(this));
  }

  /**
   * Event that emits when the server data has been changed
   */
  private _onServersDataChanged(): void {
    this._changeDetectorRef.markForCheck();
  }
}
