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
  Subscription,
  Subject,
  throwError
} from 'rxjs';
import {
  startWith,
  takeUntil,
  catchError
} from 'rxjs/operators';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsRoutingTabBase,
  McsDataStatusFactory,
  McsErrorHandlerService,
  CoreRoutes
} from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  unsubscribeSubject
} from '@app/utilities';
import {
  Search,
  ComponentHandlerDirective
} from '@app/shared';
import {
  ServerCommand,
  McsResource,
  RouteKey,
  McsServer,
  McsServerPlatform
} from '@app/models';
import {
  ResourcesRepository,
  ServersRepository
} from '@app/services';
import { } from '../repositories/servers.repository';
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

  @ViewChild(ComponentHandlerDirective)
  public componentHandler: ComponentHandlerDirective;

  public textContent: any;
  public serversTextContent: any;
  public serversMap: Map<string, McsServer[]>;
  public serverTextContent: any;
  public serverListSource: ServersListSource | null;
  public listStatusFactory: McsDataStatusFactory<Map<string, McsServer[]>>;
  public selectedPlatform: McsServerPlatform;

  // Subscription
  public vdcSubscription: Subscription;

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_LOADER_SPINNER;
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  private _vdc: McsResource;
  public get vdc(): McsResource { return this._vdc; }
  public set vdc(value: McsResource) {
    this._vdc = value;
    this._changeDetectorRef.markForCheck();
  }

  private _destroySubject = new Subject<void>();
  private _resourcesKeyMap: Map<string, McsServerPlatform>;

  constructor(
    _router: Router,
    _activatedRoute: ActivatedRoute,
    private _textContentProvider: McsTextContentProvider,
    private _changeDetectorRef: ChangeDetectorRef,
    private _serversRepository: ServersRepository,
    private _resourcesRepository: ResourcesRepository,
    private _errorHandlerService: McsErrorHandlerService,
    private _vdcService: VdcService
  ) {
    super(_router, _activatedRoute);
    this.vdc = new McsResource();
    this.serversMap = new Map();
    this.listStatusFactory = new McsDataStatusFactory();
    this._resourcesKeyMap = new Map();
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.servers.vdc;
    this.serversTextContent = this._textContentProvider.content.servers;

    // Initialize base class
    super.onInit();
  }

  public ngAfterViewInit() {
    Promise.resolve().then(() => {
      this.search.searchChangedStream.pipe(startWith(null), takeUntil(this._destroySubject))
        .subscribe(() => this.listStatusFactory.setInProgress());
      this._serversRepository.dataRecordsChanged.pipe(takeUntil(this._destroySubject))
        .subscribe(() => this._changeDetectorRef.markForCheck());
      this._initializeListsource();
    });
  }

  public ngOnDestroy() {
    super.onDestroy();
    unsubscribeSafely(this.vdcSubscription);
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Return true when the server is currently deleting, otherwise false
   * @param server Server to be deleted
   */
  public serverDeleting(server: McsServer): boolean {
    return server.commandAction === ServerCommand.Delete && server.isProcessing;
  }

  /**
   * Event that emits when VDC name is selected
   */
  public onSelectVdcByName(event: MouseEvent, resource: McsServerPlatform): void {
    if (!isNullOrEmpty(event)) { event.stopPropagation(); }
    if (isNullOrEmpty(resource.resourceId)) { return; }

    this._changeDetectorRef.markForCheck();
    this.router.navigate([
      CoreRoutes.getNavigationPath(RouteKey.VdcDetail),
      resource.resourceId
    ]);
  }

  /**
   * Event that emits when the tab is changed in the routing tabgroup
   * @param tab Active tab
   */
  protected onTabChanged(tab: any) {
    this.router.navigate([
      CoreRoutes.getNavigationPath(RouteKey.VdcDetail),
      this.paramId,
      tab.id
    ]);
  }

  /**
   * Event that emits when the parameter id is changed
   * @param id Id of the parameter
   */
  protected onParamIdChanged(id: string): void {
    if (isNullOrEmpty(id)) { return; }
    // We need to recreate the component in order for the
    // component to generate new instance
    if (!isNullOrEmpty(this.componentHandler)) {
      this.componentHandler.recreateComponent();
    }

    this._getVdcById(id);
    if (isNullOrEmpty(this.selectedPlatform)) {
      let resourceExist = this._resourcesRepository.dataRecords
        .find((resourceId) => resourceId.id === this.paramId);
      this._setSelectedPlatformByResource(resourceExist);
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
    this.serverListSource.findAllRecordsMapStream(keyFn)
      .pipe(
        takeUntil(this._destroySubject),
        catchError((error) => {
          this.listStatusFactory.setError();
          return throwError(error);
        })
      )
      .subscribe((response) => {
        this.serversMap = response;
        this.search.showLoading(false);
        this.listStatusFactory.setSuccessful(response);
        this._setSelectedPlatformByResource(this.vdc);
      });
    this._changeDetectorRef.markForCheck();
  }

  /**
   * This will set the active vdc when data was obtained from repository
   * @param vdcId VDC identification
   */
  private _getVdcById(vdcId: string): void {
    this.vdcSubscription = this._resourcesRepository
      .findRecordById(vdcId)
      .pipe(
        catchError((error) => {
          // Handle common error status code
          this._errorHandlerService.handleHttpRedirectionError(error.status);
          return throwError(error);
        })
      )
      .subscribe((response) => {
        this.vdc = response;
        this._setSelectedPlatformByResource(this.vdc);
        this._vdcService.setSelectedVdc(this.vdc);
      });
  }

  /**
   * Sets the selected platform based on its name
   * @param resource Resource name to be the basis
   */
  private _setSelectedPlatformByResource(resource: McsResource): void {
    if (isNullOrEmpty(resource)) { return; }
    let platform = this._resourcesKeyMap.get(resource.name);
    if (!isNullOrEmpty(platform)) {
      this.selectedPlatform = platform;
    }
  }
}
