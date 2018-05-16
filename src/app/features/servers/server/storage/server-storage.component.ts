import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  Observable,
  Subscription,
  Subject
} from 'rxjs/Rx';
import {
  startWith,
  takeUntil
} from 'rxjs/operators';
import {
  ServerManageStorage,
  ServerStorage,
  ServerStorageDevice,
  ServerStorageDeviceUpdate,
  ServerServiceType
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
import { ServerService } from '../server.service';
import { ServersService } from '../../servers.service';
import { ServersRepository } from '../../servers.repository';
import { ServersResourcesRepository } from '../../servers-resources.repository';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  convertGbToMb
} from '../../../../utilities';
import {
  ServerDetailsBase,
  McsStorage,
  DeleteStorageDialogComponent,
} from '../../shared';

const STORAGE_SLIDER_STEP_DEFAULT = 10;
const STORAGE_MAXIMUM_DISKS = 14;
const STORAGE_MINIMUM_VALUE = 1024;

@Component({
  selector: 'mcs-server-storage',
  templateUrl: './server-storage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  }
})

export class ServerStorageComponent extends ServerDetailsBase
  implements OnInit, OnDestroy {
  @ViewChild('mcsStorage')
  public mcsStorage: McsStorage;

  public textContent: any;
  public storageChangedValue: ServerManageStorage;
  public selectedStorageDevice: ServerStorageDevice;
  public dataStatusFactory: McsDataStatusFactory<ServerStorageDevice[]>;

  // Subscriptions
  public updateDisksSubscription: Subscription;
  public storageSubscription: Subscription;

  private _storageProfile: string;
  private _newDisk: ServerStorageDevice;

  private _destroySubject = new Subject<void>();

  public get storageIconKey(): string {
    return CoreDefinition.ASSETS_SVG_STORAGE;
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_SVG_WARNING;
  }

  public get sliderStep(): number {
    return STORAGE_SLIDER_STEP_DEFAULT;
  }

  public get storageMinValueMB(): number {
    return STORAGE_MINIMUM_VALUE;
  }

  // Check if the current server's serverType is managed
  public get isManaged(): boolean {
    return this.server.serviceType === ServerServiceType.Managed;
  }

  public get hasStorageProfileList(): boolean {
    return !isNullOrEmpty(this.resourceStorage);
  }

  public get hasStorageDevice(): boolean {
    return !isNullOrEmpty(this.server.storageDevices);
  }

  public get hasMultipleStorageDevice(): boolean {
    return this.hasStorageDevice && this.server.storageDevices.length > 1;
  }

  public get hasReachedDisksLimit(): boolean {
    return this.hasStorageDevice && this.server.storageDevices.length >= STORAGE_MAXIMUM_DISKS;
  }

  public get hasAvailableStorageSpace(): boolean {
    return this.convertDiskToGB(this.maximumMB) > 0;
  }

  public get isValidStorageValues(): boolean {
    return this._validateStorageChangedValues();
  }

  public get hasDiskStorageProfile(): boolean {
    return !isNullOrEmpty(this.selectedStorageDevice.storageProfile);
  }

  public get resourceStorage(): ServerStorage[] {
    return !isNullOrEmpty(this.serverResource.storage) ?
      this.serverResource.storage : new Array();
  }

  public get serverDisks(): ServerStorageDevice[] {
    return isNullOrEmpty(this._newDisk) ?
      this.server.storageDevices :
      [...this.server.storageDevices, this._newDisk];
  }

  private _minimumMB: number;
  public get minimumMB(): number {
    return this._minimumMB;
  }
  public set minimumMB(value: number) {
    if (this._minimumMB !== value) {
      this._minimumMB = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  private _maximumMB: number;
  public get maximumMB(): number {
    return this._maximumMB;
  }
  public set maximumMB(value: number) {
    if (this._maximumMB !== value) {
      this._maximumMB = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  private _expandStorage: boolean;
  public get expandStorage(): boolean {
    return this._expandStorage;
  }
  public set expandStorage(value: boolean) {
    if (this._expandStorage !== value) {
      this._expandStorage = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  private _deletingStorage: boolean;
  public get deletingStorage(): boolean {
    return this._deletingStorage;
  }
  public set deletingStorage(value: boolean) {
    if (this._deletingStorage !== value) {
      this._deletingStorage = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  public get attachStorageIsDisabled(): boolean {
    return !this.server.executable || !this.isValidStorageValues
      || !this.hasAvailableStorageSpace;
  }

  constructor(
    _serversResourcesRepository: ServersResourcesRepository,
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
      _serversResourcesRepository,
      _serversRepository,
      _serversService,
      _serverService,
      _changeDetectorRef,
      _textProvider,
      _errorHandlerService
    );
    this.expandStorage = false;
    this.deletingStorage = false;
    this.selectedStorageDevice = new ServerStorageDevice();
    this.minimumMB = 0;
    this.storageChangedValue = new ServerManageStorage();
    this.storageChangedValue.valid = false;
    this._storageProfile = '';
    this.dataStatusFactory = new McsDataStatusFactory(this._changeDetectorRef);
  }

  public ngOnInit() {
    // OnInit
    this.textContent = this._textProvider.content.servers.server.storage;
    this.initialize();
    this._registerJobEvents();
  }

  public ngOnDestroy() {
    this.dispose();
    this._unregisterJobEvents();
    unsubscribeSafely(this.storageSubscription);
  }

  public onStorageChanged(serverStorage: ServerManageStorage) {
    this.storageChangedValue = serverStorage;

    if (!isNullOrEmpty(serverStorage.storage) &&
      serverStorage.storage.name !== this._storageProfile) {
      this._storageProfile = serverStorage.storage.name;
      this.maximumMB = this.getStorageAvailableMemory(this._storageProfile);
    }
  }

  public closeExpandStorageBox() {
    this.selectedStorageDevice = new ServerStorageDevice();
    this.expandStorage = false;
  }

  /**
   * Event that emits when user clicked on expand link
   * @param storageDevice Storage to be expanded
   */
  public showExpandStorageBox(storage: ServerStorageDevice) {
    if (!this.server.executable || this.server.isProcessing
      || isNullOrEmpty(storage.storageProfile)) { return; }

    this.minimumMB = this._getMinimumStorageMB(storage.sizeMB);
    this.maximumMB = this.getStorageAvailableMemory(storage.storageProfile);
    this.selectedStorageDevice = storage;
    this.expandStorage = true;
  }

  /**
   * Event that emits when user deleted a storage
   * @param storage Storage to be deleted
   */
  public onDeleteStorage(storage: ServerStorageDevice): void {
    if (!this.server.executable || this.server.isProcessing) { return; }

    let dialogRef = this._dialogService.open(DeleteStorageDialogComponent, {
      data: storage,
      size: 'medium'
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this._executeDeleteStorage(storage);
      }
    });
  }

  /**
   * This will process the adding of disk
   */
  public onClickAttach(): void {
    if (this.attachStorageIsDisabled) { return; }

    this.mcsStorage.completed();

    let storageData = new ServerStorageDeviceUpdate();
    storageData.storageProfile = this.storageChangedValue.storage.name;
    storageData.sizeMB = this.storageChangedValue.storageMB;
    storageData.clientReferenceObject = {
      serverId: this.server.id,
      name: `${this.textContent.diskName} ${this.server.storageDevices.length + 1}`,
      storageProfile: this.storageChangedValue.storage.name,
      sizeMB: this.storageChangedValue.storageMB
    };

    this._resetDiskValues();
    this._serversService.createServerStorage(this.server.id, storageData).subscribe();
  }

  /**
   * This will process the update for the selected disk
   */
  public onExpandStorage(): void {
    if (this.attachStorageIsDisabled) { return; }

    let storageData = new ServerStorageDeviceUpdate();
    storageData.name = this.selectedStorageDevice.name;
    storageData.storageProfile = this.selectedStorageDevice.storageProfile;
    storageData.sizeMB = this.storageChangedValue.storageMB;
    storageData.clientReferenceObject = {
      serverId: this.server.id,
      diskId: this.selectedStorageDevice.id,
      name: this.selectedStorageDevice.name,
      storageProfile: this.selectedStorageDevice.storageProfile,
      sizeMB: this.storageChangedValue.storageMB
    };

    this._serversService.setServerSpinner(this.server, this.selectedStorageDevice);
    this._serversService.updateServerStorage(
      this.server.id,
      this.selectedStorageDevice.id,
      storageData)
      .catch((error) => {
        this._serversService.clearServerSpinner(this.server, this.selectedStorageDevice);
        return Observable.throw(error);
      })
      .subscribe(() => {
        this.expandStorage = false;
      });
  }

  /**
   * This will return the available memory of
   * the selected storage profile from the resource
   *
   * @param storageProfile Resource storage profile
   */
  public getStorageAvailableMemory(storageProfile: string): number {
    let storage = this._getStorageByProfile(storageProfile);
    return this._serverService.computeAvailableStorageMB(storage,
      this.server.compute && this.server.compute.memoryMB);
  }

  /**
   * This will identify if expand disk is disabled or enabled
   *
   * @param disk Server disk
   */
  public expandDiskIsDisabled(disk: ServerStorageDevice): boolean {
    return !this.server.executable || !this.hasAvailableStorageSpace
      || isNullOrEmpty(disk.storageProfile);
  }

  /**
   * Event that emits when the server selection was changed
   * `@Note:` Base implementation
   */
  protected serverSelectionChanged(): void {
    this._getResourceStorage();
    if (!this.server.isProcessing ||
      isNullOrEmpty(this.server.storageDevices)) {
      this._getServerDisks();
    }
  }

  /**
   * This will process the deletion of the selected disk
   *
   * @param storage Disk to be deleted
   */
  private _executeDeleteStorage(storage: ServerStorageDevice): void {
    if (this.server.isProcessing) { return; }
    this.mcsStorage.completed();

    let storageData = new ServerStorageDeviceUpdate();
    storageData.clientReferenceObject = {
      serverId: this.server.id,
      diskId: storage.id,
      storageProfile: storage.storageProfile,
      sizeMB: storage.sizeMB
    };
    this._serversService.setServerSpinner(this.server, storage);
    this._serversService
      .deleteServerStorage(this.server.id, storage.id, storageData)
      .catch((error) => {
        this._serversService.clearServerSpinner(this.server, this.selectedStorageDevice);
        return Observable.throw(error);
      })
      .subscribe();
  }

  /**
   * This will return the resource storage
   * where the provided storage profile belongs
   *
   * @param profile Storage profile
   */
  private _getStorageByProfile(profile: string): ServerStorage {
    let serverStorage = new ServerStorage();

    if (!isNullOrEmpty(this.resourceStorage)) {
      let targetStorage = this.resourceStorage.find((storage) => {
        return storage.name === profile;
      });

      if (!isNullOrEmpty(targetStorage)) {
        serverStorage = targetStorage;
      }
    }
    return serverStorage;
  }

  /**
   * This will validate the the values of the storage
   */
  private _validateStorageChangedValues(): boolean {
    let isValid: boolean = false;

    if (this.expandStorage) {
      isValid = this.storageChangedValue.storageMB > this.selectedStorageDevice.sizeMB
        && this.storageChangedValue.valid;
    } else {
      isValid = this.storageChangedValue.storageMB > this.minimumMB
        && this.storageChangedValue.valid;
    }

    return isValid;
  }

  /**
   * Register jobs/notifications events
   */
  private _registerJobEvents(): void {
    this._serversRepository.notificationsChanged
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(() => { this._changeDetectorRef.markForCheck(); });
    this._notificationEvents.createServerDisk
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(this._onCreateServerDisk.bind(this));
    this._notificationEvents.updateServerDisk
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(this._onUpdateServerDisk.bind(this));
    this._notificationEvents.deleteServerDisk
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(this._onDeleteServerDisk.bind(this));
  }

  /**
   * Unregister jobs/notifications events
   */
  private _unregisterJobEvents(): void {
    this._destroySubject.next();
    this._destroySubject.complete();
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
        this._updateResourceStorageUsedMB(job);

      case McsDataStatus.Error:
      default:
        this._newDisk = undefined;
        this._getServerDisks();
        break;
    }
  }

  /**
   * Event that emits when updating a server disk
   * @param job Emitted job content
   */
  private _onUpdateServerDisk(job: McsApiJob): void {
    if (!this.serverIsActiveByJob(job)) { return; }

    if (job.dataStatus === McsDataStatus.Success) {
      this._updateResourceStorageUsedMB(job);
      this._getServerDisks();
    }
  }

  /**
   * Event that emits when deleting a server disk
   * @param job Emitted job content
   */
  private _onDeleteServerDisk(job: McsApiJob): void {
    if (!this.serverIsActiveByJob(job)) { return; }

    if (job.dataStatus === McsDataStatus.Success) {
      // Update resource values
      let resourceStorage = this._getStorageByProfile(job.clientReferenceObject.storageProfile);
      if (!isNullOrEmpty(resourceStorage)) {
        resourceStorage.usedMB -= job.clientReferenceObject.sizeMB;
        this.maximumMB = this.getStorageAvailableMemory(job.clientReferenceObject.storageProfile);
      }

      // Get and update server disks
      this._getServerDisks();
    }
  }

  /**
   * Will trigger if currently adding a disk
   * @param job Emitted job content
   */
  private _onAddingDisk(job: McsApiJob): void {
    if (!this.serverIsActiveByJob(job)) { return; }

    this._newDisk = new ServerStorageDevice();
    this._newDisk.name = job.clientReferenceObject.name;
    this._newDisk.sizeMB = job.clientReferenceObject.sizeMB;
    this._newDisk.storageProfile = job.clientReferenceObject.storageProfile;
    this._newDisk.isProcessing = this.server.isProcessing;
  }

  /**
   * Will trigger once a disk was added successfully
   * @param job Emitted job content
   */
  private _updateResourceStorageUsedMB(job: McsApiJob): void {
    if (!this.serverIsActiveByJob(job)) { return; }

    // Update resource values
    let resourceStorage = this._getStorageByProfile(job.clientReferenceObject.storageProfile);

    if (!isNullOrEmpty(resourceStorage)) {
      resourceStorage.usedMB += job.clientReferenceObject.sizeMB;
      this.maximumMB = this.getStorageAvailableMemory(job.clientReferenceObject.storageProfile);
    }
  }

  /**
   * This will reset the disks values
   */
  private _resetDiskValues(): void {
    this.storageChangedValue = new ServerManageStorage();
    let storage = new ServerManageStorage();
    storage.storage = { name: this._storageProfile } as ServerStorage;
    storage.storageMB = 0;
    storage.valid = false;
    this.onStorageChanged(storage);
  }

  /**
   * This will update the list of server disks
   */
  private _getServerDisks(): void {
    unsubscribeSafely(this.updateDisksSubscription);

    this.dataStatusFactory.setInProgress();
    this.updateDisksSubscription = this._serversRepository
      .findServerDisks(this.server)
      .catch((error) => {
        // Handle common error status code
        this.dataStatusFactory.setError();
        return Observable.throw(error);
      })
      .subscribe((response) => {
        this.dataStatusFactory.setSuccesfull(response);
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Get the resource storage to the selected server
   */
  private _getResourceStorage(): void {
    if (isNullOrEmpty(this.serverResource)) { return; }

    this.storageSubscription = this._serversResourcesRespository
      .findResourceStorage(this.serverResource)
      .subscribe(() => {
        // Subscribe to update the storage to server resource
      });
  }

  /**
   * Get storage minimum value in MB
   * @param sizeMB Storage size in MB
   */
  private _getMinimumStorageMB(sizeMB: number): number {
    if (isNullOrEmpty(sizeMB)) { return 0; }

    /**
     * Business Rule:
     * Minimum value must be greater than the current value
     * and multiple of default slider step
     */
    let sizeGB = this.convertDiskToGB(sizeMB);
    let isExactMultiple = sizeGB % STORAGE_SLIDER_STEP_DEFAULT === 0;
    let minimumStorageMB = convertGbToMb(STORAGE_SLIDER_STEP_DEFAULT *
      (Math.ceil(sizeGB / STORAGE_SLIDER_STEP_DEFAULT)));

    return isExactMultiple ? sizeMB : minimumStorageMB;
  }
}
