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
  of
} from 'rxjs';
import {
  startWith,
  takeUntil,
  catchError,
  tap,
  shareReplay,
  switchMap,
  concatMap
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
  McsServerPlatform,
  McsResource
} from '@app/models';
import {
  McsServersRepository,
  McsResourcesRepository
} from '@app/services';
import { EventBusDispatcherService } from '@app/event-bus';
import { ServerService } from './server.service';
import { ServersListSource } from '../servers.listsource';
import { ServerDetails } from './server-details';

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
  public serverDetails$: Observable<ServerDetails>;
  public serversMap$: Observable<Map<string, McsServer[]>>;
  public serverListSource: ServersListSource | null;
  public listStatusFactory: McsDataStatusFactory<Map<string, McsServer[]>>;

  @ViewChild(ComponentHandlerDirective)
  private _componentHandler: ComponentHandlerDirective;

  private _destroySubject = new Subject<void>();
  private _resourcesKeyMap: Map<string, McsServerPlatform>;

  constructor(
    _eventDispatcher: EventBusDispatcherService,
    _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _resourcesRespository: McsResourcesRepository,
    private _serversRepository: McsServersRepository,
    private _serverService: ServerService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_eventDispatcher, _activatedRoute);
    this._resourcesKeyMap = new Map();
    this.listStatusFactory = new McsDataStatusFactory(this._changeDetectorRef);
  }

  public ngOnInit() {
    super.onInit();
  }

  public ngAfterViewInit() {
    Promise.resolve().then(() => {
      this.search.searchChangedStream
        .pipe(startWith(null), takeUntil(this._destroySubject))
        .subscribe(() => this.listStatusFactory.setInProgress());
      this._initializeListsource();
    });
  }

  public ngOnDestroy() {
    super.onDestroy();
    unsubscribeSafely(this._destroySubject);
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
    this._subscribeToServerDetails(id);
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
    this.serverListSource = new ServersListSource(
      this._serversRepository,
      this.search
    );

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
   * This will set the active server when data was obtained from repository
   * @param serverId Server ID to be the basis of the server
   */
  private _subscribeToServerDetails(serverId: string): void {
    this.serverDetails$ = this._serversRepository.getByIdAsync(serverId).pipe(
      concatMap((selectedServer) => {
        let resourceId = getSafeProperty(selectedServer, (obj) => obj.platform.resourceId);
        return this._getServerResourceByPlatform(resourceId).pipe(
          switchMap((selectedResource) =>
            of({ server: selectedServer, resource: selectedResource } as ServerDetails)
          )
        );
      }),
      tap((details) => {
        if (isNullOrEmpty(details)) { return; }
        this._serverService.setServerDetails(details);
        this.serverPermission = new McsServerPermission(details.server);
      }),
      shareReplay(1)
    );
  }

  /**
   * Gets the server resource based on the server platform data
   * @param platform Platform on what resourceId to be obtained
   */
  private _getServerResourceByPlatform(resourceId: string): Observable<McsResource> {
    if (isNullOrEmpty(resourceId)) {
      throw new Error('Server platform resource id is undefined.');
    }

    return this._resourcesRespository.getByIdAsync(resourceId).pipe(
      catchError(() => of(null))
    );
  }
}
