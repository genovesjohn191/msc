import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewChild
} from '@angular/core';
import {
  Subject,
  throwError,
  Observable
} from 'rxjs';
import {
  startWith,
  takeUntil,
  catchError,
  shareReplay
} from 'rxjs/operators';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsNotificationEventsService,
  McsDialogService,
  McsErrorHandlerService,
  McsLoadingService,
  McsTableDataSource
} from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSubject,
  animateFactory
} from '@app/utilities';
import { ComponentHandlerDirective } from '@app/shared';
import {
  McsJob,
  DataStatus,
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
import {
  DeleteStorageDialogComponent,
  ServerManageStorage
} from '../../shared';
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

  public textContent: any;
  public manageStorage: ServerManageStorage;
  public selectedStorage: McsResourceStorage;
  public selectedDisk: McsServerStorageDevice;

  public disksDataSource: McsTableDataSource<McsServerStorageDevice>;
  public disksColumns: string[];

  private _newDisk: McsServerStorageDevice;
  private _inProgressDiskId: string;
  private _destroySubject = new Subject<void>();

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
    _textProvider: McsTextContentProvider,
    _errorHandlerService: McsErrorHandlerService,
    _loadingService: McsLoadingService,
    private _serversService: ServersService,
    private _dialogService: McsDialogService,
    private _notificationEvents: McsNotificationEventsService
  ) {
    super(
      _resourcesRepository,
      _serversRepository,
      _serverService,
      _changeDetectorRef,
      _textProvider,
      _errorHandlerService,
      _loadingService
    );
    this._newDisk = new McsServerStorageDevice();
    this.disksColumns = new Array();
    this.manageStorage = new ServerManageStorage();
    this.diskMethodType = ServerDiskMethodType.AddDisk;
  }

  public ngOnInit() {
    this.textContent = this._textProvider.content.servers.server.storage;
    this.initialize();
    this._setDataColumns();
    this._registerJobEvents();
  }

  public ngOnDestroy() {
    this.dispose();
    unsubscribeSubject(this._destroySubject);
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
   * Returns true when the storage has atleast 2 disk or more
   */
  public canDeleteDisk(server: McsServer): boolean {
    return isNullOrEmpty(server.storageDevices) ? false :
      server.storageDevices.length > 1;
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
    diskValues.storageProfile = this.manageStorage.storage.name;
    diskValues.sizeMB = this.manageStorage.sizeMB;
    diskValues.clientReferenceObject = {
      serverId: server.id,
      name: `${this.textContent.diskName} ${server.storageDevices.length + 1}`,
      storageProfile: this.manageStorage.storage.name,
      sizeMB: this.manageStorage.sizeMB
    };

    this._serversService.setServerSpinner(server);
    this._serversRepository.createServerStorage(server.id, diskValues)
      .pipe(
        catchError((error) => {
          this._serversService.clearServerSpinner(server);
          this._errorHandlerService.handleHttpRedirectionError(error.status);
          return throwError(error);
        })
      ).subscribe();
  }

  /**
   * Deletes the selected disk
   * @param disk Storage disk to be deleted
   */
  public deleteDisk(server: McsServer, disk: McsServerStorageDevice): void {
    let dialogRef = this._dialogService.open(DeleteStorageDialogComponent, {
      data: disk,
      size: 'medium'
    });

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
            this._errorHandlerService.handleHttpRedirectionError(error.status);
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
          this._errorHandlerService.handleHttpRedirectionError(error.status);
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
    return disk.id === this._inProgressDiskId;
  }

  /**
   * Event that emits when the server selection was changed
   * `@Note:` Base implementation
   */
  protected selectionChange(server: McsServer, resource: McsResource): void {
    this._resetStorageValues();
    this._getResourceStorages(resource);
    this._initializeDataSource(server);
  }

  /**
   * Initializes the data source of the disks table
   */
  private _initializeDataSource(server: McsServer): void {
    this.disksDataSource = new McsTableDataSource(
      this._serversRepository.getServerDisks(server)
    );
  }

  /**
   * Reset storage form values to initial
   */
  private _resetStorageValues(): void {
    this.diskMethodType = ServerDiskMethodType.AddDisk;
    this.manageStorage = new ServerManageStorage();
    if (!isNullOrEmpty(this._componentHandler)) {
      this._componentHandler.recreateComponent();
    }
  }

  /**
   * Register disk jobs events
   */
  private _registerJobEvents(): void {
    this._notificationEvents.createServerDisk
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(this._onCreateServerDisk.bind(this));

    this._notificationEvents.updateServerDisk
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(this._onUpdateServerDisk.bind(this));

    this._notificationEvents.deleteServerDisk
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(this._onUpdateServerDisk.bind(this));
  }

  /**
   * Event that emits when creating a server disk
   * @param job Emitted job content
   */
  private _onCreateServerDisk(job: McsJob): void {
    if (!this.serverIsActiveByJob(job)) { return; }

    switch (job.dataStatus) {
      case DataStatus.InProgress:
        this._onAddingDisk(job);
        break;

      case DataStatus.Success:
        this.refreshServerResource();
      case DataStatus.Error:
      default:
        this.disksDataSource.deleteRecordBy((item) => this._newDisk.id === item.id);
        break;
    }
  }

  /**
   * Event that emits when updating a server disk
   * @param job Emitted job content
   */
  private _onUpdateServerDisk(job: McsJob): void {
    if (!this.serverIsActiveByJob(job)) { return; }

    // Refresh the data when the disk in-progress is already completed
    let inProgressDiskEnded = !isNullOrEmpty(this._inProgressDiskId)
      && job.dataStatus === DataStatus.Success;
    if (inProgressDiskEnded) { this.refreshServerResource(); }

    // Set the inprogress disk ID to be checked
    this._inProgressDiskId = job.dataStatus === DataStatus.InProgress ?
      job.clientReferenceObject.diskId : undefined;
  }

  /**
   * Will trigger if currently adding a disk
   * @param job Emitted job content
   */
  private _onAddingDisk(job: McsJob): void {
    if (!this.serverIsActiveByJob(job)) { return; }

    // Mock disk data based on job response
    this._newDisk.id = this._inProgressDiskId;
    this._newDisk.name = job.clientReferenceObject.name;
    this._newDisk.sizeMB = job.clientReferenceObject.sizeMB;
    this._newDisk.storageProfile = job.clientReferenceObject.storageProfile;
    this.disksDataSource.addOrUpdateRecord(this._newDisk);
  }

  /**
   * Sets data column for the corresponding table
   */
  private _setDataColumns(): void {
    this.disksColumns = Object.keys(this.textContent.columnHeaders);
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
