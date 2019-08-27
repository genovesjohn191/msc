import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  shareReplay
} from 'rxjs/operators';
import {
  McsRoutingTabBase,
  McsDataStatusFactory,
  McsNavigationService
} from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { Search } from '@app/shared';
import {
  McsResource,
  RouteKey,
  McsServer,
  McsServerPlatform
} from '@app/models';
import { McsApiService } from '@app/services';
import { McsEvent } from '@app/events';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import { ServersListSource } from '../servers.listsource';
import { VdcService } from './vdc.service';

// Add another group type in here if you have addition tab
type tabGroupType = 'overview';

@Component({
  selector: 'mcs-vdc',
  templateUrl: './vdc.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  }
})
export class VdcComponent
  extends McsRoutingTabBase<tabGroupType>
  implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('search')
  public search: Search;

  public serverListSource: ServersListSource | null;
  public listStatusFactory: McsDataStatusFactory<Map<string, McsServer[]>>;

  public selectedResource$: Observable<McsResource>;
  public selectedPlatform$: Observable<McsServerPlatform>;
  public serversMap$: Observable<Map<string, McsServer[]>>;

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  private _serversDataChangeHandler: Subscription;
  private _destroySubject = new Subject<void>();
  private _resourcesKeyMap: Map<string, McsServerPlatform>;

  constructor(
    _eventDispatcher: EventBusDispatcherService,
    _activatedRoute: ActivatedRoute,
    private _navigationService: McsNavigationService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService,
    private _vdcService: VdcService
  ) {
    super(_eventDispatcher, _activatedRoute);
    this.listStatusFactory = new McsDataStatusFactory();
    this._resourcesKeyMap = new Map();
    this._registerEvents();
  }

  public ngOnInit() {
    super.onInit();
  }

  public ngAfterViewInit() {
    Promise.resolve().then(() => {
      this.search.searchChangedStream.pipe(startWith(null), takeUntil(this._destroySubject))
        .subscribe(() => this.listStatusFactory.setInProgress());
      this._initializeListsource();
    });
  }

  public ngOnDestroy() {
    super.onDestroy();
    unsubscribeSafely(this._serversDataChangeHandler);
    unsubscribeSafely(this._destroySubject);
  }

  /**
   * Event that emits when VDC name is selected
   */
  public onSelectVdcByName(event: MouseEvent, resource: McsServerPlatform): void {
    if (!isNullOrEmpty(event)) { event.stopPropagation(); }
    if (isNullOrEmpty(resource.resourceId)) { return; }

    this._changeDetectorRef.markForCheck();
    this._navigationService.navigateTo(RouteKey.VdcDetails, [resource.resourceId]);
  }

  /**
   * Event that emits when the tab is changed in the routing tabgroup
   * @param tab Active tab
   */
  protected onTabChanged(tab: any) {
    this._navigationService.navigateTo(RouteKey.VdcDetails, [this.paramId, tab.id]);
  }

  /**
   * Event that emits when the parameter id is changed
   * @param id Id of the parameter
   */
  protected onParamIdChanged(id: string): void {
    if (isNullOrEmpty(id)) { return; }
    this._subscribesToResourceById(id);
  }

  /**
   * Initialize list source
   */
  private _initializeListsource(): void {
    this.serverListSource = new ServersListSource(
      this._apiService,
      this.search
    );

    // Key function pointer for mapping objects
    let keyFn = (item: McsServer) => {
      let resourceName = isNullOrEmpty(item.platform) ? 'others' : item.platform.resourceName;
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
   * This will set the active vdc when data was obtained from repository
   * @param vdcId VDC identification
   */
  private _subscribesToResourceById(vdcId: string): void {
    this.selectedResource$ = this._apiService.getResource(vdcId).pipe(
      tap((response) => { this._vdcService.setSelectedVdc(response); }),
      shareReplay(1)
    );
  }

  /**
   * Registers the data events
   */
  private _registerEvents(): void {
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
