import {
  of,
  throwError,
  BehaviorSubject,
  Observable,
  Subject,
  Subscription
} from 'rxjs';
import {
  catchError,
  filter,
  finalize,
  map,
  shareReplay,
  switchMap,
  take,
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
  TemplateRef,
  ViewChild
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import {
  McsAccessControlService,
  McsAuthenticationIdentity,
  McsMatTableConfig,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsServerPermission,
  McsTableDataSource2
} from '@app/core';
import { McsEvent } from '@app/events';
import {
  FlatOption,
  ServerManageNetwork
} from '@app/features-shared';
import {
  IpAllocationMode,
  McsApiCollection,
  McsFeatureFlag,
  McsFilterInfo,
  McsJob,
  McsNetworkDbVlanQueryParams,
  McsPermission,
  McsQueryParam,
  McsResource,
  McsResourceNetwork,
  McsServer,
  McsServerCreateNic,
  McsServerNic,
  McsServerSnapshot,
  PlatformType
} from '@app/models';
import {
  ComponentHandlerDirective,
  DialogConfirmation,
  DialogRef,
  DialogService
} from '@app/shared';
import {
  addOrUpdateArrayRecord,
  animateFactory,
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  isNullOrUndefined,
  unsubscribeSafely,
  CommonDefinition,
  Guid,
  TreeDatasource,
  TreeGroup,
  TreeItem,
  TreeUtility
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { ServerDetailsBase } from '../server-details.base';

// Enumeration
export enum ServerNicMethodType {
  None = 0,
  AddNic = 1,
  EditNic = 2,
  DeleteNic = 3,
  ViewNic = 4
}

// Constants
const SERVER_MAXIMUM_NICS = 10;
const SERVER_NIC_NEW_ID = Guid.newGuid().toString();

@Component({
  selector: 'mcs-server-nics',
  templateUrl: './server-nics.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.fadeIn
  ],
  host: {
    'class': 'block'
  }
})

export class ServerNicsComponent extends ServerDetailsBase implements OnInit, OnDestroy {
  public resourceNetworks$: Observable<McsResourceNetwork[]>;
  public dataSourceInProgress$: BehaviorSubject<boolean>;

  public currentIpAddress: string;
  public manageNetwork: ServerManageNetwork;
  public selectedNetwork: McsResourceNetwork;
  public selectedNic: McsServerNic;

  public readonly nicsDataSource: McsTableDataSource2<McsServerNic>;
  public readonly nicsColumns: McsFilterInfo[];
  public readonly nicsBladeDataSource: McsTableDataSource2<McsServerNic>;
  public readonly nicsBladeColumns: McsFilterInfo[];
  public readonly filterPredicate: (filter) => boolean;

  public fcVlan = new FormControl<any>(null);
  public datasourceVlan: TreeDatasource<FlatOption>;
  public isSnapshotProcessing: boolean;
  public dialogRef: DialogRef<any>;
  public isVMWareToolsInstalled: boolean;
  public isVMWareToolsRunning: boolean;
  public serverIsBlade: boolean = false;
  public isNetworkVlansLoading: boolean = false;

  @ViewChild('submitDialogTemplate')
  private _submitDialogTemplate: TemplateRef<any>;

  private _newNic: McsServerNic;
  private _inProgressNicId: string;
  private _serverNicsCache: Observable<McsServerNic[]>;
  private _destroySubject = new Subject<void>();
  private _nicsDataChange = new BehaviorSubject<McsServerNic[]>(null);
  private _sortDef: MatSort;
  private _sortSubject = new Subject<void>();
  private _serverIsDedicated: boolean;
  private _selectedServer: McsServer = null;
  private _selectedServerResource: McsResource = null;
  private _hasInternalPrivateCloudEngineerAccess: boolean = false;
  private _isUcsBladeNicEditFeatureEnabled = false;
  private _vlanOptions = new BehaviorSubject<FlatOption[]>(null);

  private _createNicHandler: Subscription;
  private _updateNicHandler: Subscription;
  private _deleteNicHandler: Subscription;

  @ViewChild(ComponentHandlerDirective)
  private _componentHandler: ComponentHandlerDirective;

  public get checkIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHECK;
  }

  public get errorIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ERROR;
  }

  public get title(): string {
    if (!this._isUcsBladeNicEditFeatureEnabled || (this.serverIsBlade && !this._hasInternalPrivateCloudEngineerAccess)) {
      return this._translateService.instant('serverNics.titleView');
    }
    return this._translateService.instant('serverNics.titleManage');
  }

  /**
   * Returns the enum type of the server nic method
   */
  public get serverNicMethodTypeEnum(): any {
    return ServerNicMethodType;
  }

  /**
   * Returns true when there is a selected network when adding nic and the inputted is valid
   */
  public get inputIsValid(): boolean {
    return !isNullOrEmpty(this.manageNetwork)
      && this.manageNetwork.valid;
  }

  /**
   * Returns the nic type based on the method currently invoked
   */
  private _nicMethodType: ServerNicMethodType = ServerNicMethodType.AddNic;
  public get nicMethodType(): ServerNicMethodType { return this._nicMethodType; }
  public set nicMethodType(value: ServerNicMethodType) {
    if (this._nicMethodType !== value) {
      this._nicMethodType = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _translateService: TranslateService,
    private _dialogService: DialogService,
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _accessControlService: McsAccessControlService
  ) {
    super(_injector, _changeDetectorRef);
    this.dataSourceInProgress$ = new BehaviorSubject(false);
    this.manageNetwork = new ServerManageNetwork();
    this.nicMethodType = ServerNicMethodType.AddNic;
    this.nicsDataSource = new McsTableDataSource2(this._getServerNics.bind(this));
    this.nicsBladeDataSource = new McsTableDataSource2(this._getServerNics.bind(this));
    this.filterPredicate = this._isColumnIncluded.bind(this);
    this.nicsColumns = [
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'name' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'network' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'primary' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'type' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'ipMode' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'ipAddresses' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'action' })
    ];
    this.nicsBladeColumns = [
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'name' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'network' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'ipAddresses' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'action' })
    ];
    this.nicsDataSource
      .registerConfiguration(new McsMatTableConfig(false, true))
      .registerColumnsFilterInfo(this.nicsColumns, this.filterPredicate);
    this.nicsBladeDataSource
      .registerConfiguration(new McsMatTableConfig(false, true))
      .registerColumnsFilterInfo(this.nicsBladeColumns, this.filterPredicate);
    this.datasourceVlan = new TreeDatasource<FlatOption>(this._convertVlanOptionsToTreeItems.bind(this));
  }

  @ViewChild('sort')
  public set sort(value: MatSort) {
    if (isNullOrEmpty(value)) { return; }
    this._sortSubject.next();

    value.sortChange.pipe(
      takeUntil(this._sortSubject),
      switchMap(response => {
        if (!response) { return of(null); }

        return this.server$.pipe(
          take(1),
          tap(server => this._updateTableDataSource(server))
        );
      })
    ).subscribe();

    this._sortDef = value;
  }

  public ngOnInit() {
    this._hasInternalPrivateCloudEngineerAccess = this._accessControlService.hasPermission([McsPermission.InternalPrivateCloudEngineerAccess]);
    this._isUcsBladeNicEditFeatureEnabled = this._accessControlService.hasAccessToFeature(McsFeatureFlag.UcsBladeNicEdit);
    this.server$.subscribe(server => {
      this._serverIsDedicated = server.isDedicated;
      this._selectedServer = server;
    });
    this._registerEvents();
  }

  private _getSelectedServerResource(resourceId: string) {
    this.apiService.getResource(resourceId).subscribe(resource => {
      this._selectedServerResource = resource;
    });
  }

  public ngOnDestroy() {
    this.dispose();
    unsubscribeSafely(this._createNicHandler);
    unsubscribeSafely(this._updateNicHandler);
    unsubscribeSafely(this._deleteNicHandler);
  }

  private _isColumnIncluded(filter: McsFilterInfo): boolean {
    if (filter.id === 'primary') {
      if (isNullOrUndefined(this._serverIsDedicated)) { return false; }
      return !this._serverIsDedicated;
    }
    if (filter.id === 'ipMode') {
      if (isNullOrUndefined(this._serverIsDedicated)) { return false; }
      return !this._serverIsDedicated;
    }
    return true;
  }

  /**
   * Returns true when the nics has reached its limitation
   */
  public hasReachedNicsLimit(server: McsServer): boolean {
    return !isNullOrEmpty(server.nics) &&
      server.nics.length >= SERVER_MAXIMUM_NICS;
  }

  /**
   * Event that emits when data in network component has been changed
   * @param manageNetwork Manage Network content
   */
  public onNetworkChanged(manageNetwork: ServerManageNetwork): void {
    if (isNullOrEmpty(manageNetwork)) { return; }
    this.manageNetwork = manageNetwork;
  }

  /**
   * Returns true when user can add nic
   */
  public canAddNic(server: McsServer, resourceNetworks: McsResourceNetwork[]): boolean {
    return !this.hasReachedNicsLimit(server)
      && !isNullOrEmpty(resourceNetworks)
      && !this._serverIsDedicated;
  }

  /**
   * Opens the edit nic window
   * @param nic NIC to be edited
   */
  public openEditNicWindow(nic: McsServerNic): void {
    if (isNullOrEmpty(nic)) { return; }
    this.selectedNic = nic;
    this.nicMethodType = ServerNicMethodType.EditNic;
    if (!isNullOrEmpty(nic.ipAddresses)) {
      this.currentIpAddress = nic.ipAddresses[0];
    }
    if (this.serverIsBlade) {
      this._setVlanOptions(nic);
      return;
    }
    this._selectNetworkByName(nic.networkName);
  }

  /**
   * Closes the edit nic window
   */
  public closeEditNicWindow(networks: McsResourceNetwork[]): void {
    this._resetNetworkValues(networks);
  }

  /**
   * Closes the edit nic window for blade servers
   */
  public closeEditBladeNicWindow(): void {
    this._resetNetworkVlanValues();
  }

  /**
   * Opens the view nic window
   * @param nic NIC to be viewed
   */
  public openViewNicWindow(nic: McsServerNic): void {
    if (isNullOrEmpty(nic)) { return; }
    this.selectedNic = nic;
    this.nicMethodType = ServerNicMethodType.ViewNic;
    if (!isNullOrEmpty(nic.ipAddresses)) {
      this.currentIpAddress = nic.ipAddresses[0];
    }
    this._setVlanOptions(nic);
  }

  /**
   * Closes the view nic window
   */
  public closeViewNicWindow(networks: McsResourceNetwork[]): void {
    this._resetNetworkValues(networks);
  }

  /**
   * Add NIC to the current server
   */
  public addNic(server: McsServer): void {
    let nicValues = new McsServerCreateNic();
    nicValues.name = this.manageNetwork.network.name;
    nicValues.ipAllocationMode = this.manageNetwork.ipAllocationMode;
    nicValues.ipAddress = this.manageNetwork.customIpAddress;
    nicValues.connected = this.manageNetwork.connected;
    nicValues.clientReferenceObject = {
      serverId: server.id,
      nicName: nicValues.name,
      nicIpAllocationMode: nicValues.ipAllocationMode,
      nicIpAddress: nicValues.ipAddress
    };

    this.apiService.addServerNic(server.id, nicValues).subscribe();
  }

  /**
   * Closes the server snapshot includesMemory dialog box
   */
  public closeDialog(): void {
    this.dialogRef.close();
  }

  /**
   * Deletes the selected NIC
   * @param nic NIC to be deleted
   */
  public deleteNic(server: McsServer, nic: McsServerNic): void {
    this.isSnapshotProcessing = true;
    this.apiService.getServerSnapshots(server.id)
      .pipe(
        takeUntil(this._destroySubject),
        catchError((error) => {
          this.isSnapshotProcessing = false;
          this._changeDetectorRef.markForCheck();
          return throwError(error);
        })
      )
      .subscribe((snapshot: McsApiCollection<McsServerSnapshot>) => {
        this.isSnapshotProcessing = false;
        let snapshots = getSafeProperty(snapshot, (obj) => obj.collection);
        let serverHasSnapshots = snapshots.length > 0;
        if (serverHasSnapshots) {
          let snapshotIncludesMemory = snapshots.find((data) => data.includesMemory);
          snapshotIncludesMemory ?
            this.serverDialogBoxIncludesMemory() :
            this.serverDialogBoxNoMemory(server, nic);
        } else {
          this.serverDialogBoxNoMemory(server, nic);
        }
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Checks whether Blade nic update button should be disabled in Edit mode
   */
  public isNetworkVlanDisabled(): boolean {
    return (!this.fcVlan.valid)
      || JSON.stringify(this.selectedNic.unpackedVlanNumberRanges) === JSON.stringify(this.fcVlan.value);
  }

  /**
   * Updates the NIC data based on the selected NIC
   */
  public updateNic(server: McsServer, networks: McsResourceNetwork[]): void {
    let nicValues = new McsServerCreateNic();
    nicValues.name = this.manageNetwork.network.name;
    nicValues.ipAllocationMode = this.manageNetwork.ipAllocationMode;
    nicValues.ipAddress = this.manageNetwork.customIpAddress;
    nicValues.connected = this.manageNetwork.connected;
    nicValues.clientReferenceObject = {
      serverId: server.id,
      nicId: this.selectedNic.id
    };

    this.closeEditNicWindow(networks);
    this.apiService.updateServerNic(server.id, this.selectedNic.id, nicValues).subscribe();
  }

  /**
   * Updates the Blade NIC data based on the selected NIC
   */
  public updateNicBlade(server: McsServer): void {
    let nicValues = new McsServerCreateNic();
    nicValues.name = this.selectedNic.name;
    nicValues.ipAllocationMode = IpAllocationMode.Manual;
    nicValues.ipAddresses = this.selectedNic.ipAddresses;
    nicValues.connected = this.selectedNic.connected;
    nicValues.vlanNumberRanges = this.fcVlan.value;
    nicValues.clientReferenceObject = {
      serverId: server.id,
      nicId: this.selectedNic.id
    };
    this.closeEditNicWindow([]);
    this.apiService.updateServerNic(server.id, this.selectedNic.id, nicValues).subscribe();
  }

  /**
   * Returns true when inputted nic is currently in-progress
   * @param nic NIC to be checked
   */
  public nicIsInProgress(nic: McsServerNic): boolean {
    if (isNullOrEmpty(nic)) { return false; }
    let newNicId = getSafeProperty(this._newNic, (obj) => obj.id);
    return nic.id === newNicId || nic.id === this._inProgressNicId;
  }

  /**
   * Returns true when the edit nic link is visible for blade server
   * @param nic Nic to be checked
   */
  public isEditNicBladeVisible(nic: McsServerNic): boolean {
    if ((isNullOrEmpty(nic) || !this._hasInternalPrivateCloudEngineerAccess)) {
      return false;
    }
    return this.serverIsBlade && !nic.isESXVirtualKernelInterface && this._isUcsBladeNicEditFeatureEnabled;
  }

  /**
   * Returns true when the view nic link is visible for blade server
   * @param nic Nic to be checked
   */
  public isViewNicBladeVisible(nic: McsServerNic): boolean {
    if (!this._isUcsBladeNicEditFeatureEnabled) { return true; }
    if (isNullOrEmpty(nic) || this._hasInternalPrivateCloudEngineerAccess) {
      return false;
    }
    return this.serverIsBlade && !nic.isESXVirtualKernelInterface && !isNullOrEmpty(nic.vlanNumberRanges);
  }

  /**
   * Returns true when the edit nic link is enabled
   * @param nic Nic to be checked
   */
  public isEditNicEnabled(server: McsServer, nic: McsServerNic): boolean {
    if (isNullOrEmpty(nic)) { return false; }
    return !this._serverIsDedicated && (server.isSelfManaged || !nic.isPrimary);
  }

  public getPowerStatePermission(server: McsServer): McsServerPermission {
    return new McsServerPermission(server);
  }

  public isVMwareToolsRunningOrNotApplicable(server: McsServer): boolean  {
    return !(server.isVMware && server.isVM) || server.isVMWareToolsRunning;
  }

  /**
   * Event that emits when the selected server has been changed
   * @param server Server details of the selected record
   */
  protected serverChange(server: McsServer): void {
    this.serverIsBlade = server.platform?.type === PlatformType.UcsCentral || server.platform?.type === PlatformType.UcsDomain;
    if (this.serverIsBlade) {
      this._getSelectedServerResource(server?.platform?.resourceId);
      this._resetNetworkVlanValues();
    }
    else {
      let resourceId = getSafeProperty(server, (obj) => obj.platform.resourceId);
      // if(!this.serverIsBlade){this._getResourceNetworks(resourceId);}
      this._getResourceNetworks(resourceId);
      this._resetNetworkValues([]);
    }
    this.validateDedicatedFeatureFlag(server, McsFeatureFlag.DedicatedVmNicView);
    this._updateTableDataSource(server);
    this.isVMWareToolsInstalled = server.isVMWareToolsInstalled;
    this.isVMWareToolsRunning = server.isVMWareToolsRunning;
  }

  /**
   * Dialog box for server snapshot with includesMemory=true
   */
  private serverDialogBoxIncludesMemory(): void {
    this.dialogRef = this._dialogService.open(this._submitDialogTemplate, {
      size: 'medium'
    });
  }

  /**
   * Dialog box for server with empty snapshot or includesMemory=false
   */
  private serverDialogBoxNoMemory(server: McsServer, nic: McsServerNic): void {
    let dialogData = {
      data: nic,
      type: 'warning',
      title: this._translateService.instant('dialog.nicDelete.title'),
      message: this._translateService.instant('dialog.nicDelete.noMemory.message', { nic_name: nic.name })
    } as DialogConfirmation<McsServerNic>;

    this.dialogRef = this._dialogService.openConfirmation(dialogData);
    this.selectedNic = nic;

    this.dialogRef.afterClosed().subscribe((result) => {
      if (isNullOrEmpty(result)) { return; }

      let nicValues = new McsServerCreateNic();
      nicValues.name = this.selectedNic.networkName;
      nicValues.clientReferenceObject = {
        serverId: server.id,
        nicId: this.selectedNic.id
      };
      this.apiService.deleteServerNic(server.id, this.selectedNic.id, nicValues).subscribe();
    });
  }

  /**
   * Reset network form values to initial
   */
  private _resetNetworkValues(networks: McsResourceNetwork[]): void {
    this.nicMethodType = ServerNicMethodType.AddNic;
    this._serverNicsCache = null;
    this.manageNetwork = new ServerManageNetwork();
    this.currentIpAddress = undefined;
    this.selectedNetwork = isNullOrEmpty(networks) ? null : networks[0];
    if (!isNullOrEmpty(this._componentHandler)) {
      this._componentHandler.recreateComponent();
    }
  }

  /**
   * Reset network vlan form values to initial
   */
  private _resetNetworkVlanValues(): void {
    this.nicMethodType = ServerNicMethodType.AddNic;
    this._serverNicsCache = null;
    this.fcVlan.reset();
    if (!isNullOrEmpty(this._componentHandler)) {
      this._componentHandler.recreateComponent();
    }
  }

  /**
   * Register jobs/notifications events
   */
  private _registerEvents(): void {
    this._createNicHandler = this.eventDispatcher.addEventListener(
      McsEvent.jobServerNicCreate, this._onCreateServerNic.bind(this)
    );

    this._updateNicHandler = this.eventDispatcher.addEventListener(
      McsEvent.jobServerNicUpdate, this._onUpdateServerNic.bind(this)
    );

    this._deleteNicHandler = this.eventDispatcher.addEventListener(
      McsEvent.jobServerNicDelete, this._onUpdateServerNic.bind(this)
    );

    // Invoke the event initially
    this.eventDispatcher.dispatch(McsEvent.jobServerNicCreate);
    this.eventDispatcher.dispatch(McsEvent.jobServerNicUpdate);
    this.eventDispatcher.dispatch(McsEvent.jobServerNicDelete);
  }

  /**
   * Initializes the data source of the disks table
   */
  private _updateTableDataSource(server?: McsServer): void {
    let queryParam = new McsQueryParam();
    queryParam.sortDirection = this._sortDef?.direction;
    queryParam.sortField = this._sortDef?.active;

    this.dataSourceInProgress$.next(true);
    let serverNicsDataSource: Observable<McsServerNic[]>;

    if (!isNullOrEmpty(server)) {
      serverNicsDataSource = this.apiService.getServerNics(server.id, queryParam).pipe(
        map((response) => getSafeProperty(response, (obj) => obj.collection)),
        tap((records) => this._serverNicsCache = of(records))
      );
    }

    let tableDataSource = (isNullOrEmpty(this._serverNicsCache) || !isNullOrEmpty(this._sortDef?.direction)) ?
      serverNicsDataSource : this._serverNicsCache;

    let hasNewRecord = !isNullOrEmpty(this._newNic) && !isNullOrEmpty(tableDataSource);
    if (hasNewRecord) {
      tableDataSource = tableDataSource.pipe(
        map((result) => {
          result = addOrUpdateArrayRecord(result, this._newNic, false,
            (item) => item.id === SERVER_NIC_NEW_ID);
          return result;
        })
      );
    }

    tableDataSource.pipe(
      take(1),
      tap(dataRecords => this._nicsDataChange.next(dataRecords || [])),
      finalize(() => this.dataSourceInProgress$.next(false))
    ).subscribe();
  }

  /**
   * Selects the network by its resource name
   * @param networkName Network name to be find in the resources
   */
  private _selectNetworkByName(networkName: string): void {
    if (isNullOrEmpty(networkName)) { return; }
    this.resourceNetworks$.subscribe((resourceNetworks) => {
      let foundNetwork = resourceNetworks.find((network) => network.networkName === networkName);
      if (!isNullOrEmpty(foundNetwork)) {
        this.selectedNetwork = foundNetwork;
      }
    });
  }

  /**
   * Event that emits when adding a server nic
   * @param job Emitted job content
   */
  private _onCreateServerNic(job: McsJob): void {
    let serverIsActive = this.serverIsActiveByJob(job);
    if (!serverIsActive) { return; }

    // Refresh everything when all job is done
    if (!job.inProgress) {
      this._newNic = null;
      this.refreshServerResource();
      return;
    }

    // Add in progress jobs
    this._newNic = new McsServerNic();
    this._newNic.id = SERVER_NIC_NEW_ID;
    this._newNic.networkName = job.clientReferenceObject.nicName;
    this._newNic.ipAllocationMode = job.clientReferenceObject.nicIpAllocationMode;
    this._newNic.ipAddresses = [job.clientReferenceObject.nicIpAddress];
    this._updateTableDataSource();
  }

  /**
   * Event that emits when either updating or deleting a server nic
   * @param job Emitted job content
   */
  private _onUpdateServerNic(job: McsJob): void {
    let serverIsActive = this.serverIsActiveByJob(job);
    if (!serverIsActive) { return; }

    // Refresh everything when all job is done
    if (!job.inProgress) {
      this._inProgressNicId = null;
      this.refreshServerResource();
      return;
    }

    // Add in progress jobs
    this._inProgressNicId = job.clientReferenceObject.nicId;
  }

  /**
   * Get the resource networks from the server
   */
  private _getResourceNetworks(resourceId: string): void {
    if (isNullOrEmpty(resourceId)) { return; }

    this.resourceNetworks$ = this.apiService.getResourceNetworks(resourceId).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.collection)),
      shareReplay(1)
    );
  }

  /**
   * Gets the server nics based on observable
   */
  private _getServerNics(_param: McsMatTableQueryParam): Observable<McsMatTableContext<McsServerNic>> {
    return this._nicsDataChange.pipe(
      takeUntil(this._destroySubject),
      filter(response => !isNullOrUndefined(response)),
      map(response => {
        return new McsMatTableContext(response, response?.length)
      })
    );
  }

  /**
   * Converts vlan options into tree items for the select tree view field
   */
  private _convertVlanOptionsToTreeItems(): Observable<TreeItem<string>[]> {
    return this._vlanOptions.pipe(
      map(records => {
        let groupNames = isNullOrEmpty(records) ? ['No networks to display.'] : ['Available Networks'];
        return TreeUtility.convertEntityToTreemItems(groupNames,
          record => new TreeGroup(record, record, records),
          child => new TreeGroup(child.value, child.key, null, {
            selectable: true
          }))
      }),
      tap(() => this._changeDetectorRef.markForCheck())
    );
  }

  /**
   * Sets the initially selected network Vlans
   */
  private _setSelectedNetworks(nic: McsServerNic): void {
    this.fcVlan.setValue(nic.unpackedVlanNumberRanges);
    this.fcVlan.updateValueAndValidity();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Arranges and sets the vlan options for the network vlan select field
   */
  private _setVlanOptions(selectedNic: McsServerNic): void {
    this.isNetworkVlansLoading = true;
    this._getNetworkDbVlanOptions(selectedNic).subscribe(records => {
      let availableVlanIds = records.map(opt => opt.key);
      selectedNic.unpackedVlanNumberRanges.filter(id => {
        // Add Vlans not found in returned list into Network Vlan field options
        if (!availableVlanIds.includes(id)) {
          let option: FlatOption = {
            key: id,
            value: this._getMappedNetworkName(id)
          };
          records.push(option);
        }
      });

      this._vlanOptions.next(records);
      this._setSelectedNetworks(selectedNic);
      this.isNetworkVlansLoading = false;
    });
  }

  /**
   * Gets the network vlan options available from getNetworkDbVlans
   */
  private _getNetworkDbVlanOptions(selectedNic: McsServerNic): Observable<FlatOption[]> {
    let currentUserActiveCompanyId = this._authenticationIdentity.activeAccount.id;
    let queryParam = new McsNetworkDbVlanQueryParams();
    queryParam.pageSize = 9999;
    queryParam.podSiteName = this._selectedServer?.availabilityZone;
    queryParam.podName = this._selectedServerResource?.podName;
    queryParam.networkCompanyId = currentUserActiveCompanyId;

    if (isNullOrUndefined(this._selectedServerResource) || isNullOrUndefined(currentUserActiveCompanyId) || this.isViewNicBladeVisible(selectedNic)) { return of([]); }

    return this.apiService.getNetworkDbVlans(queryParam).pipe((
      map((vlans) => {
        let options: FlatOption[] = [];
        vlans.collection.forEach(vlan => {
          // Create option item
          let option: FlatOption = {
            key: vlan.number,
            value: this._getMappedNetworkName(vlan.number)
          };
          options.push(option);
        });
        return options;
      })
    ));
  }

  /**
   * Returns the network name of the resource network that matches the given vlan id
   */
  private _getMappedNetworkName(vlanNumber: number): string {
    let networkVlan = this._selectedServerResource?.networks?.find(network => network.vlanNumber === vlanNumber);
    let networkName = isNullOrUndefined(networkVlan?.networkName) ? 'Unknown' : networkVlan.networkName;
    return `${networkName} (VLAN ${vlanNumber})`;
  }
}
