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
  McsSearch,
  McsRoutingTabBase,
  McsDataStatusFactory,
  McsErrorHandlerService
} from '../../../core';
import {
  isNullOrEmpty,
  refreshView,
  unsubscribeSafely,
  compareStrings
} from '../../../utilities';
import {
  Resource,
  ResourcesRepository
} from '../../resources';
import {
  Server,
  ServerCommand,
  ServerPlatform
} from '../models';
import { ServersRepository } from '../servers.repository';
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
  public search: McsSearch;

  public textContent: any;
  public serversTextContent: any;
  public serversMap: Map<string, Server[]>;
  public serverTextContent: any;
  public serverListSource: ServersListSource | null;
  public listStatusFactory: McsDataStatusFactory<Map<string, Server[]>>;
  public selectedPlatform: ServerPlatform;

  // Subscription
  public vdcSubscription: Subscription;

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  private _vdc: Resource;
  public get vdc(): Resource { return this._vdc; }
  public set vdc(value: Resource) {
    this._vdc = value;
    this._changeDetectorRef.markForCheck();
  }

  private _destroySubject = new Subject<void>();
  private _resourcesKeyMap: Map<string, ServerPlatform>;

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
    this.vdc = new Resource();
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
    refreshView(() => {
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
    this._destroySubject.next();
    this._destroySubject.complete();
  }

  /**
   * Event that emits when the server is selected on the list panel
   * @param _server Selected server instance
   */
  public onServerSelect(server: Server) {
    if (isNullOrEmpty(server)) { return; }
    this.router.navigate(['/servers', server.id]);
  }

  /**
   * Return true when the server is currently deleting, otherwise false
   * @param server Server to be deleted
   */
  public serverDeleting(server: Server): boolean {
    return server.commandAction === ServerCommand.Delete && server.isProcessing;
  }

  /**
   * Event that emits when VDC name is selected
   */
  public onSelectVdcByName(event: MouseEvent, resource: ServerPlatform): void {
    if (!isNullOrEmpty(event)) { event.stopPropagation(); }
    if (isNullOrEmpty(resource.resourceId)) { return; }

    this._changeDetectorRef.markForCheck();
    this.router.navigate(['servers/vdc/', resource.resourceId]);
  }

  /**
   * Returns true if current group is selected
   * @param platform Platform to be selected
   */
  public isSelected(platform: ServerPlatform): boolean {
    if (isNullOrEmpty(this.selectedPlatform)) { return false; }
    return compareStrings(platform.resourceName, this.selectedPlatform.resourceName) === 0;
  }

  /**
   * Event that emits when the tab is changed in the routing tabgroup
   * @param tab Active tab
   */
  protected onTabChanged(tab: any) {
    // Navigate route based on current active tab
    this.router.navigate(['servers/vdc/', this.paramId, tab.id]);
  }

  /**
   * Event that emits when the parameter id is changed
   * @param id Id of the parameter
   */
  protected onParamIdChanged(id: string): void {
    if (isNullOrEmpty(id)) { return; }
    this._getVdcById(id);

    // Set the selection iniatially when no selected item
    // in order for the header to show it immediately
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
    let keyFn = (item: Server) => {
      let resourceName = isNullOrEmpty(item.platform) ? 'others' : item.platform.resourceName;
      let resource: ServerPlatform = this._resourcesKeyMap.get(resourceName);
      if (isNullOrEmpty(resource)) {
        let resourceInstance = new ServerPlatform();
        resourceInstance.resourceName = 'Others';
        resource = !isNullOrEmpty(item.platform.resourceName) ? item.platform : resourceInstance;
      }
      this._resourcesKeyMap.set(resourceName, resource);
      return resource;
    };

    // Listen to all records changed
    this.serverListSource.findAllRecordsMapStream(keyFn)
      .pipe(
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
        unsubscribeSafely(this.vdcSubscription);
      });
  }

  /**
   * Sets the selected platform based on its name
   * @param resource Resource name to be the basis
   */
  private _setSelectedPlatformByResource(resource: Resource): void {
    if (isNullOrEmpty(resource)) { return; }
    let platform = this._resourcesKeyMap.get(resource.name);
    if (!isNullOrEmpty(platform)) {
      this.selectedPlatform = platform;
    }
  }
}
