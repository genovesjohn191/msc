import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
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
  ResourceStorage,
  ResourcesRepository
} from '../../../resources';
import {
  ServerManageStorage,
  ServerStorageDevice,
  ServerStorageDeviceUpdate
} from '../../models';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsNotificationEventsService,
  McsApiJob,
  McsDialogService,
  McsErrorHandlerService,
  McsDataStatusFactory,
  McsDataStatus
} from '../../../../core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  unsubscribeSubject,
  animateFactory,
  getSafeProperty
} from '../../../../utilities';
import { DeleteStorageDialogComponent } from '../../shared';
import { ServerService } from '../server.service';
import { ServersService } from '../../servers.service';
import { ServersRepository } from '../../servers.repository';
import { ServerDetailsBase } from '../server-details.base';

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
  public textContent: any;
  public manageStorage: ServerManageStorage;
  public selectedStorage: ResourceStorage;
  public selectedDisk: ServerStorageDevice;
  public dataStatusFactory: McsDataStatusFactory<ServerStorageDevice[]>;
  public manageStorageTemplate: any[];

  private _updateDiskSubscription: Subscription;
  private _storagesSubscription: Subscription;
  private _newDisk: ServerStorageDevice;
  private _inProgressDiskId: string;
  private _destroySubject = new Subject<void>();

  public get storageIconKey(): string {
    return CoreDefinition.ASSETS_SVG_STORAGE;
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  /**
   * Returns true when the disks has reached its limitation
   */
  public get hasReachedDisksLimit(): boolean {
    return !isNullOrEmpty(this.server.storageDevices) &&
      this.server.storageDevices.length >= SERVER_MAXIMUM_DISKS;
  }

  /**
   * Returns all the server disks including the newly created disk as a mock data
   */
  public get serverDisks(): ServerStorageDevice[] {
    if (isNullOrEmpty(this.server.storageDevices)) { return new Array(); }
    return isNullOrEmpty(this._newDisk) ?
      this.server.storageDevices :
      [...this.server.storageDevices, this._newDisk];
  }

  /**
   * Returns all the resource storages
   */
  public get resourceStorages(): ResourceStorage[] {
    return getSafeProperty(this.serverResource, (obj) => obj.storage);
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
    _resourcesRepository: ResourcesRepository,
    _serversRepository: ServersRepository,
    _serversService: ServersService,
    _serverService: ServerService,
    _changeDetectorRef: ChangeDetectorRef,
    _textProvider: McsTextContentProvider,
    _errorHandlerService: McsErrorHandlerService,
    private _dialogService: McsDialogService,
    private _notificationEvents: McsNotificationEventsService
  ) {
    super(
      _resourcesRepository,
      _serversRepository,
      _serversService,
      _serverService,
      _changeDetectorRef,
      _textProvider,
      _errorHandlerService
    );
    this.manageStorageTemplate = [{}];
    this.manageStorage = new ServerManageStorage();
    this.dataStatusFactory = new McsDataStatusFactory(this._changeDetectorRef);
    this.diskMethodType = ServerDiskMethodType.AddDisk;
  }

  public ngOnInit() {
    this.textContent = this._textProvider.content.servers.server.storage;
    this.initialize();
    this._registerJobEvents();
  }

  public ngOnDestroy() {
    this.dispose();
    unsubscribeSubject(this._destroySubject);
    unsubscribeSafely(this._storagesSubscription);
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
   * Returns true when there is a selected storage when adding disk and the inputted is valid
   */
  public get inputIsValid(): boolean {
    return !isNullOrEmpty(this.manageStorage)
      && this.manageStorage.valid;
  }

  /**
   * Returns true when the storage has atleast 2 disk or more
   */
  public get canDeleteDisk(): boolean {
    return isNullOrEmpty(this.server.storageDevices) ? false :
      this.server.storageDevices.length > 1;
  }

  /**
   * Returns true when user can add disk or not
   */
  public get canAddDisk(): boolean {
    return !this.hasReachedDisksLimit
      && !isNullOrEmpty(this.resourceStorages);
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
  public openExpandDiskWindow(disk: ServerStorageDevice): void {
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
  public addDisk(): void {
    let diskValues = new ServerStorageDeviceUpdate();
    diskValues.storageProfile = this.manageStorage.storage.name;
    diskValues.sizeMB = this.manageStorage.sizeMB;
    diskValues.clientReferenceObject = {
      serverId: this.server.id,
      name: `${this.textContent.diskName} ${this.server.storageDevices.length + 1}`,
      storageProfile: this.manageStorage.storage.name,
      sizeMB: this.manageStorage.sizeMB
    };

    this._serversService.setServerSpinner(this.server, diskValues);
    this._serversService.createServerStorage(this.server.id, diskValues)
      .pipe(
        catchError((error) => {
          this._serversService.clearServerSpinner(this.server, diskValues);
          this._errorHandlerService.handleHttpRedirectionError(error.status);
          return throwError(error);
        })
      ).subscribe();
  }

  /**
   * Deletes the selected disk
   * @param disk Storage disk to be deleted
   */
  public deleteDisk(disk: ServerStorageDevice): void {
    let dialogRef = this._dialogService.open(DeleteStorageDialogComponent, {
      data: disk,
      size: 'medium'
    });

    this.selectedDisk = disk;
    dialogRef.afterClosed().subscribe((result) => {
      if (isNullOrEmpty(result)) { return; }

      let diskValues = new ServerStorageDeviceUpdate();
      diskValues.clientReferenceObject = {
        serverId: this.server.id,
        diskId: this.selectedDisk.id,
        storageProfile: this.selectedDisk.storageProfile,
        sizeMB: this.selectedDisk.sizeMB
      };
      this._serversService.setServerSpinner(this.server, this.selectedDisk);
      this._serversService.deleteServerStorage(this.server.id, this.selectedDisk.id, diskValues)
        .pipe(
          catchError((error) => {
            this._serversService.clearServerSpinner(this.server, this.selectedDisk);
            this._errorHandlerService.handleHttpRedirectionError(error.status);
            return throwError(error);
          })
        ).subscribe();
    });
  }

  /**
   * Expands the storage of the selected disk
   */
  public expandDisk(): void {
    let diskValues = new ServerStorageDeviceUpdate();
    diskValues.name = this.selectedStorage.name;
    diskValues.storageProfile = this.selectedStorage.name;
    diskValues.sizeMB = this.manageStorage.sizeMB;
    diskValues.clientReferenceObject = {
      serverId: this.server.id,
      diskId: this.selectedDisk.id
    };

    this.closeExpandDiskWindow();
    this._serversService.setServerSpinner(this.server, this.selectedDisk);
    this._serversService.updateServerStorage(this.server.id, this.selectedDisk.id, diskValues)
      .pipe(
        catchError((error) => {
          this._serversService.clearServerSpinner(this.server, this.selectedDisk);
          this._errorHandlerService.handleHttpRedirectionError(error.status);
          return throwError(error);
        })
      ).subscribe();
  }

  /**
   * Returns true when inputted disk is currently in-progress
   * @param disk Disk to be checked
   */
  public diskIsInProgress(disk: ServerStorageDevice): boolean {
    if (isNullOrEmpty(disk)) { return false; }
    return disk.id === this._inProgressDiskId;
  }

  /**
   * Event that emits when the server selection was changed
   * `@Note:` Base implementation
   */
  protected serverSelectionChanged(): void {
    this._resetStorageValues();
    this._getResourceStorage();
    this._getServerDisks();
  }

  /**
   * Reset storage form values to initial
   */
  private _resetStorageValues(): void {
    this.diskMethodType = ServerDiskMethodType.AddDisk;
    this.manageStorage = new ServerManageStorage();

    // We need to set the first instance of the template
    // in order to re-initialize the storage component and have fresh data
    this.manageStorageTemplate[0] = {};
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
  private _onCreateServerDisk(job: McsApiJob): void {
    if (!this.serverIsActiveByJob(job)) { return; }

    switch (job.dataStatus) {
      case McsDataStatus.InProgress:
        this._onAddingDisk(job);
        break;

      case McsDataStatus.Success:
        this.refreshServerResource();
      case McsDataStatus.Error:
      default:
        this._newDisk = undefined;
        break;
    }
  }

  /**
   * Event that emits when updating a server disk
   * @param job Emitted job content
   */
  private _onUpdateServerDisk(job: McsApiJob): void {
    if (!this.serverIsActiveByJob(job)) { return; }

    // Refresh the data when the disk in-progress is already completed
    let inProgressDiskEnded = !isNullOrEmpty(this._inProgressDiskId)
      && job.dataStatus === McsDataStatus.Success;
    if (inProgressDiskEnded) { this.refreshServerResource(); }

    // Set the inprogress disk ID to be checked
    this._inProgressDiskId = job.dataStatus === McsDataStatus.InProgress ?
      job.clientReferenceObject.diskId : undefined;
  }

  /**
   * Will trigger if currently adding a disk
   * @param job Emitted job content
   */
  private _onAddingDisk(job: McsApiJob): void {
    if (!this.serverIsActiveByJob(job)) { return; }

    // Mock disk data based on job response
    this._newDisk = new ServerStorageDevice();
    this._newDisk.id = this._inProgressDiskId;
    this._newDisk.name = job.clientReferenceObject.name;
    this._newDisk.sizeMB = job.clientReferenceObject.sizeMB;
    this._newDisk.storageProfile = job.clientReferenceObject.storageProfile;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * This will update the list of server disks
   */
  private _getServerDisks(): void {
    unsubscribeSafely(this._updateDiskSubscription);

    this.dataStatusFactory.setInProgress();
    this._updateDiskSubscription = this._serversRepository
      .findServerDisks(this.server)
      .pipe(
        catchError((error) => {
          // Handle common error status code
          this.dataStatusFactory.setError();
          return throwError(error);
        })
      )
      .subscribe((response) => {
        this.dataStatusFactory.setSuccessful(response);
      });
  }

  /**
   * Get the resource storage to the selected server
   */
  private _getResourceStorage(): void {
    let hasResource = getSafeProperty(this.serverResource, (obj) => obj.id);
    if (!hasResource) { return; }

    this._storagesSubscription = this._resourcesRespository
      .findResourceStorage(this.serverResource)
      .subscribe(() => {
        // Subscribe to update the storage to server resource
      });
  }
}
