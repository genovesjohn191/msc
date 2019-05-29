import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewChild
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  throwError,
  Observable,
  Subscription,
  of
} from 'rxjs';
import {
  catchError,
  shareReplay,
  map,
  tap
} from 'rxjs/operators';
import {
  CoreDefinition,
  McsErrorHandlerService,
  McsTableDataSource,
  McsAccessControlService,
  CoreEvent,
  McsGuid
} from '@app/core';
import {
  isNullOrEmpty,
  animateFactory,
  unsubscribeSafely,
  getSafeProperty,
  addOrUpdateArrayRecord
} from '@app/utilities';
import {
  ComponentHandlerDirective,
  DialogService,
  DialogConfirmation
} from '@app/shared';
import {
  McsJob,
  McsResourceStorage,
  McsServerStorageDevice,
  McsServerStorageDeviceUpdate,
  McsServer,
  McsResource
} from '@app/models';
import {
  McsServersRepository,
  McsResourcesRepository
} from '@app/services';
import { ServerManageStorage } from '@app/features-shared';
import { EventBusDispatcherService } from '@app/event-bus';
import { ServerService } from '../server.service';
import { ServerDetailsBase } from '../server-details.base';
import { ServersService } from '../../servers.service';

// Enumeration
export enum ServerDiskMethodType {
  None = 0,
  AddDisk = 1,
  ExpandDisk = 2,
  DeleteDisk = 3
}

// Constants
const SERVER_MAXIMUM_DISKS = 14;
const SERVER_DISK_NEW_ID = McsGuid.newGuid().toString();

@Component({
  selector: 'mcs-server-storage',
  templateUrl: './server-storage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.fadeIn
  ],
  host: {
    'class': 'block'
  }
})

export class ServerStorageComponent extends ServerDetailsBase implements OnInit, OnDestroy {
  public resourceStorages$: Observable<McsResourceStorage[]>;
  public manageStorage: ServerManageStorage;
  public selectedStorage: McsResourceStorage;
  public selectedDisk: McsServerStorageDevice;

  public disksDataSource: McsTableDataSource<McsServerStorageDevice>;
  public disksColumns: string[];

  private _inProgressDisk: string;
  private _newDisk: McsServerStorageDevice;
  private _serverDisksCache: Observable<McsServerStorageDevice[]>;

  private _createDiskHandler: Subscription;
  private _updateDiskHandler: Subscription;
  private _deleteDiskHandler: Subscription;

  @ViewChild(ComponentHandlerDirective)
  private _componentHandler: ComponentHandlerDirective;

  public get storageIconKey(): string {
    return CoreDefinition.ASSETS_SVG_STORAGE;
  }

  /**
   * Returns the enum type of the server disk method
   */
  public get serverDiskMethodTypeEnum(): any {
    return ServerDiskMethodType;
  }

  /**
   * Returns the disk type based on the method currently invoked
   */
  private _diskMethodType: ServerDiskMethodType = ServerDiskMethodType.AddDisk;
  public get diskMethodType(): ServerDiskMethodType { return this._diskMethodType; }
  public set diskMethodType(value: ServerDiskMethodType) {
    if (this._diskMethodType !== value) {
      this._diskMethodType = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  constructor(
    _resourcesRepository: McsResourcesRepository,
    _serversRepository: McsServersRepository,
    _serverService: ServerService,
    _changeDetectorRef: ChangeDetectorRef,
    _errorHandlerService: McsErrorHandlerService,
    _accessControl: McsAccessControlService,
    private _eventDispatcher: EventBusDispatcherService,
    private _translateService: TranslateService,
    private _serversService: ServersService,
    private _dialogService: DialogService,
  ) {
    super(
      _resourcesRepository,
      _serversRepository,
      _serverService,
      _changeDetectorRef,
      _errorHandlerService,
      _accessControl
    );
    this.disksColumns = [];
    this.disksDataSource = new McsTableDataSource();
    this.manageStorage = new ServerManageStorage();
    this.diskMethodType = ServerDiskMethodType.AddDisk;
  }

  public ngOnInit() {
    this._setDataColumns();
    this._registerEvents();
  }

  public ngOnDestroy() {
    this.dispose();
    unsubscribeSafely(this._createDiskHandler);
    unsubscribeSafely(this._updateDiskHandler);
    unsubscribeSafely(this._deleteDiskHandler);
  }

  /**
   * Event that emits when data in storage component has been changed
   * @param manageStorage Manage Storage content
   */
  public onStorageChanged(manageStorage: ServerManageStorage): void {
    if (isNullOrEmpty(manageStorage)) { return; }
    this.manageStorage = manageStorage;
    this.selectedStorage = this.manageStorage.storage;
  }

  /**
   * Returns true when the disks has reached its limitation
   */
  public hasReachedDisksLimit(server: McsServer): boolean {
    return !isNullOrEmpty(server.storageDevices) &&
      server.storageDevices.length >= SERVER_MAXIMUM_DISKS;
  }

  /**
   * Returns true when user can add disk
   */
  public canAddDisk(server: McsServer, resourceStorages: McsResourceStorage[]): boolean {
    return !this.hasReachedDisksLimit(server) && !isNullOrEmpty(resourceStorages);
  }

  /**
   * Returns true when there is a selected storage when adding disk and the input is valid
   */
  public get inputIsValid(): boolean {
    return !isNullOrEmpty(this.manageStorage)
      && this.manageStorage.valid;
  }

  /**
   * Returns true when the input is valid and the disk can be added
   */
  public get addDiskEnabled(): boolean {
    return !isNullOrEmpty(this.manageStorage)
      && this.inputIsValid
      && this.manageStorage.sizeMB > 0;
  }

  /**
   * Returns true when the Storage data has been changed and input is valid
   */
  public get expandDiskEnabled(): boolean {
    let storageHasChanged = this.manageStorage.sizeMB > this.selectedDisk.sizeMB;
    return storageHasChanged && this.inputIsValid;
  }

  /**
   * Opens the expand disk window
   * @param disk Disk to be edited
   */
  public openExpandDiskWindow(disk: McsServerStorageDevice): void {
    if (isNullOrEmpty(disk)) { return; }
    this.selectedDisk = disk;
    this.diskMethodType = ServerDiskMethodType.ExpandDisk;
  }

  /**
   * Closes the expand disk window
   */
  public closeExpandDiskWindow(): void {
    this._resetStorageValues();
  }

  /**
   * Add disk to the current server
   */
  public addDisk(server: McsServer): void {
    let diskValues = new McsServerStorageDeviceUpdate();
    let diskName = this._translateService.instant('serverStorage.diskName');
    diskValues.storageProfile = this.manageStorage.storage.name;
    diskValues.sizeMB = this.manageStorage.sizeMB;
    diskValues.clientReferenceObject = {
      serverId: server.id,
      name: `${diskName} ${server.storageDevices.length + 1}`,
      storageProfile: this.manageStorage.storage.name,
      sizeMB: this.manageStorage.sizeMB
    };

    this._serversService.setServerSpinner(server);
    this._serversRepository.createServerStorage(server.id, diskValues)
      .pipe(
        catchError((error) => {
          this._serversService.clearServerSpinner(server);
          return throwError(error);
        })
      ).subscribe();
  }

  /**
   * Deletes the selected disk
   * @param disk Storage disk to be deleted
   */
  public deleteDisk(server: McsServer, disk: McsServerStorageDevice): void {
    let dialogData = {
      data: disk,
      type: 'warning',
      title: this._translateService.instant('dialogDetachMedia.title'),
      message: this._translateService.instant('dialogDetachMedia.message', { storage_name: disk.name })
    } as DialogConfirmation<McsServerStorageDevice>;

    let dialogRef = this._dialogService.openConfirmation(dialogData);

    this.selectedDisk = disk;
    dialogRef.afterClosed().subscribe((result) => {
      if (isNullOrEmpty(result)) { return; }

      let diskValues = new McsServerStorageDeviceUpdate();
      diskValues.clientReferenceObject = {
        serverId: server.id,
        diskId: this.selectedDisk.id,
        storageProfile: this.selectedDisk.storageProfile,
        sizeMB: this.selectedDisk.sizeMB
      };
      this._serversService.setServerSpinner(server);
      this._serversRepository.deleteServerStorage(server.id, this.selectedDisk.id, diskValues)
        .pipe(
          catchError((error) => {
            this._serversService.clearServerSpinner(server);
            return throwError(error);
          })
        ).subscribe();
    });
  }

  /**
   * Expands the storage of the selected disk
   */
  public expandDisk(server: McsServer): void {
    let diskValues = new McsServerStorageDeviceUpdate();
    diskValues.name = this.selectedStorage.name;
    diskValues.storageProfile = this.selectedStorage.name;
    diskValues.sizeMB = this.manageStorage.sizeMB;
    diskValues.clientReferenceObject = {
      serverId: server.id,
      diskId: this.selectedDisk.id
    };

    this.closeExpandDiskWindow();
    this._serversService.setServerSpinner(server);
    this._serversRepository.updateServerStorage(server.id, this.selectedDisk.id, diskValues)
      .pipe(
        catchError((error) => {
          this._serversService.clearServerSpinner(server);
          return throwError(error);
        })
      ).subscribe();
  }

  /**
   * Returns true when inputted disk is currently in-progress
   * @param disk Disk to be checked
   */
  public diskIsInProgress(disk: McsServerStorageDevice): boolean {
    if (isNullOrEmpty(disk)) { return false; }
    let newDiskId = getSafeProperty(this._newDisk, (obj) => obj.id);
    return disk.id === newDiskId || disk.id === this._inProgressDisk;
  }

  /**
   * Event that emits when the server selection was changed
   * `@Note:` Base implementation
   */
  protected selectionChange(server: McsServer, resource: McsResource): void {
    this.validateDedicatedFeatureFlag(server, 'EnableDedicatedVmStorageView');
    this._resetStorageValues();
    this._updateTableDataSource(server);
    this._getResourceStorages(resource);
  }

  /**
   * Initializes the data source of the disks table
   */
  private _updateTableDataSource(server?: McsServer): void {
    let serverDiskDataSource: Observable<McsServerStorageDevice[]>;
    if (!isNullOrEmpty(server)) {
      serverDiskDataSource = this._serversRepository.getServerDisks(server).pipe(
        tap((records) => this._serverDisksCache = of(records)));
    }
    let tableDataSource = isNullOrEmpty(this._serverDisksCache) ?
      serverDiskDataSource : this._serverDisksCache;

    let hasNewRecord = !isNullOrEmpty(this._newDisk) && !isNullOrEmpty(tableDataSource);
    if (hasNewRecord) {
      tableDataSource = tableDataSource.pipe(
        map((result) => {
          result = addOrUpdateArrayRecord(result, this._newDisk, false,
            (item) => item.id === SERVER_DISK_NEW_ID);
          return result;
        })
      );
    }
    this.disksDataSource.updateDatasource(tableDataSource);
  }

  /**
   * Reset storage form values to initial
   */
  private _resetStorageValues(): void {
    this.diskMethodType = ServerDiskMethodType.AddDisk;
    this._serverDisksCache = null;
    this.manageStorage = new ServerManageStorage();
    if (!isNullOrEmpty(this._componentHandler)) {
      this._componentHandler.recreateComponent();
    }
  }

  /**
   * Register disk jobs events
   */
  private _registerEvents(): void {
    this._createDiskHandler = this._eventDispatcher.addEventListener(
      CoreEvent.jobServerDiskCreate, this._onCreateServerDisk.bind(this)
    );

    this._updateDiskHandler = this._eventDispatcher.addEventListener(
      CoreEvent.jobServerDiskUpdate, this._onUpdateServerDisk.bind(this)
    );

    this._deleteDiskHandler = this._eventDispatcher.addEventListener(
      CoreEvent.jobServerDiskDelete, this._onUpdateServerDisk.bind(this)
    );

    // Invoke the event initially
    this._eventDispatcher.dispatch(CoreEvent.jobServerDiskCreate);
    this._eventDispatcher.dispatch(CoreEvent.jobServerDiskUpdate);
    this._eventDispatcher.dispatch(CoreEvent.jobServerDiskDelete);
  }

  /**
   * Event that emits when creating a server disk
   * @param job Emitted job content
   */
  private _onCreateServerDisk(job: McsJob): void {
    let serverIsActive = this.serverIsActiveByJob(job);
    if (!serverIsActive) { return; }

    // Refresh everything when all job is done
    if (!job.inProgress) {
      this._newDisk = null;
      this.refreshServerResource();
      return;
    }

    // Add in progress jobs
    this._newDisk = new McsServerStorageDevice();
    this._newDisk.id = SERVER_DISK_NEW_ID;
    this._newDisk.name = job.clientReferenceObject.name;
    this._newDisk.sizeMB = job.clientReferenceObject.sizeMB;
    this._newDisk.storageProfile = job.clientReferenceObject.storageProfile;
    this._updateTableDataSource();
  }

  /**
   * Event that emits when updating a server disk
   * @param jobs Emitted job content
   */
  private _onUpdateServerDisk(job: McsJob): void {
    let serverIsActive = this.serverIsActiveByJob(job);
    if (!serverIsActive) { return; }

    // Refresh everything when all job is done
    if (!job.inProgress) {
      this._inProgressDisk = null;
      this.refreshServerResource();
      return;
    }

    // Add in progress jobs
    this._inProgressDisk = job.clientReferenceObject.diskId;
  }

  /**
   * Sets data column for the corresponding table
   */
  private _setDataColumns(): void {
    this.disksColumns = Object.keys(
      this._translateService.instant('serverStorage.columnHeaders')
    );
    if (isNullOrEmpty(this.disksColumns)) {
      throw new Error('column definition for disks was not defined');
    }
  }

  /**
   * Get the resource storage to the selected server
   */
  private _getResourceStorages(resource: McsResource): void {
    if (isNullOrEmpty(resource)) { return; }
    this.resourceStorages$ = this._resourcesRespository.getResourceStorage(resource).pipe(
      shareReplay(1)
    );
  }
}
