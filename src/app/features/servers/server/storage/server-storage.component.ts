import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Subscription } from 'rxjs/Rx';
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
  McsOption
} from '../../../../core';
import { ServerService } from '../server.service';
import { ServersRepository } from '../../servers.repository';
import {
  convertToGb,
  isNullOrEmpty
} from '../../../../utilities';
import {
  ServerDetailsBase,
  McsStorage,
  DeleteStorageDialogComponent,
} from '../../shared';

const STORAGE_SLIDER_STEP_DEFAULT = 25;
const STORAGE_MAXIMUM_DISKS = 14;
const STORAGE_MINIMUM_VALUE = 1024;
const PRIMARY_STORAGE_NAME = 'Hard disk 1';

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

  public storageDeviceSubscription: Subscription;

  private _notificationsChangeSubscription: Subscription;
  private _createServerDiskSubscription: Subscription;
  private _updateServerDiskSubscription: Subscription;
  private _deleteServerDiskSubscription: Subscription;

  public get storageIconKey(): string {
    return CoreDefinition.ASSETS_SVG_STORAGE;
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_FONT_WARNING;
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
    return !isNullOrEmpty(this.storageProfileList);
  }

  public get hasStorageDevice(): boolean {
    return !isNullOrEmpty(this.server.storageDevice);
  }

  public get hasMultipleStorageDevice(): boolean {
    return this.hasStorageDevice && this.server.storageDevice.length > 1;
  }

  public get hasReachedDisksLimit(): boolean {
    return this.hasStorageDevice && this.server.storageDevice.length >= STORAGE_MAXIMUM_DISKS;
  }

  public get hasAvailableStorageSpace(): boolean {
    return this.convertStorageInGb(this.maximumMB) > 0;
  }

  public get isValidStorageValues(): boolean {
    return this._validateStorageChangedValues();
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

  private _expandingStorage: boolean;
  public get expandingStorage(): boolean {
    return this._expandingStorage;
  }
  public set expandingStorage(value: boolean) {
    if (this._expandingStorage !== value) {
      this._expandingStorage = value;
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

  public get storageScaleIsDisabled(): boolean {
    return !this.server.isOperable || this.isManaged ||
      this.isProcessingJob || !this.hasAvailableStorageSpace;
  }

  public get attachIsDisabled(): boolean {
    return !this.isValidStorageValues
      || !this.hasAvailableStorageSpace
      || this.isProcessingJob;
  }

  public get expandIsDisabled(): boolean {
    return !this.isValidStorageValues
      || this.expandingStorage
      || this.isProcessingJob;
  }

  public get storageProfileList(): any[] {
    let storageProfileList = new Array<McsOption>();

    if (!isNullOrEmpty(this.resourceStorage)) {
      this.resourceStorage.forEach((storage) => {
        storageProfileList.push({ value: storage.name, text: storage.name });
      });
    }

    return storageProfileList;
  }

  private _storageProfile: string;

  constructor(
    _serverService: ServerService,
    _changeDetectorRef: ChangeDetectorRef,
    private _textProvider: McsTextContentProvider,
    private _dialogService: McsDialogService,
    private _notificationEvents: McsNotificationEventsService,
    private _serversRepository: ServersRepository
  ) {
    // Constructor
    super(
      _serverService,
      _changeDetectorRef
    );
    this.expandStorage = false;
    this.expandingStorage = false;
    this.deletingStorage = false;
    this.selectedStorageDevice = new ServerStorageDevice();
    this.minimumMB = 0;
    this.storageChangedValue = new ServerManageStorage();
    this.storageChangedValue.valid = false;
    this._storageProfile = '';
  }

  public ngOnInit() {
    // OnInit
    this.textContent = this._textProvider.content.servers.server.storage;
    this._registerJobEvents();
    this._listenToNotificationsChange();
  }

  public ngOnDestroy() {
    this.dispose();
    this._unregisterJobEvents();

    if (!isNullOrEmpty(this._notificationsChangeSubscription)) {
      this._notificationsChangeSubscription.unsubscribe();
    }

    if (!isNullOrEmpty(this.storageDeviceSubscription)) {
      this.storageDeviceSubscription.unsubscribe();
    }
  }

  public onStorageChanged(serverStorage: ServerManageStorage) {
    this.storageChangedValue = serverStorage;

    if (!isNullOrEmpty(serverStorage.storageProfile) &&
      serverStorage.storageProfile !== this._storageProfile) {
      this._storageProfile = serverStorage.storageProfile;
      this.maximumMB = this.getStorageAvailableMemory(this._storageProfile);
    }
  }

  public onExpandStorage(storageDevice: ServerStorageDevice) {
    if (this.storageScaleIsDisabled) { return; }

    this.minimumMB = storageDevice.sizeMB;
    this.maximumMB = this.getStorageAvailableMemory(storageDevice.storageProfile);
    this.selectedStorageDevice = storageDevice;
    this.expandStorage = true;
  }

  public closeExpandStorageBox() {
    this.selectedStorageDevice = new ServerStorageDevice();
    this.expandStorage = false;
  }

  public deleteStorage(storage: ServerStorageDevice): void {
    if (this.storageScaleIsDisabled) { return; }

    let dialogRef = this._dialogService.open(DeleteStorageDialogComponent, {
      data: storage,
      size: 'medium'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.onDeleteStorage(storage);
      }
    });
  }

  public convertStorageInGb(value: number): number {
    return Math.floor(convertToGb(value));
  }

  public appendGbUnit(value: number): string {
    return `${value} ${this._textProvider.content.servers.shared.storageScale.unit}`;
  }

  /**
   * This will process the adding of disk
   */
  public onClickAttach(): void {
    if (!this.isValidStorageValues || !this.hasAvailableStorageSpace
      || this.storageScaleIsDisabled) { return; }

    this.mcsStorage.completed();

    let storageData = new ServerStorageDeviceUpdate();
    storageData.storageProfile = this.storageChangedValue.storageProfile;
    storageData.sizeMB = this.storageChangedValue.storageMB;
    storageData.clientReferenceObject = {
      serverId: this.server.id,
      name: `${this.textContent.diskName} ${this.server.storageDevice.length + 1}`,
      storageProfile: this.storageChangedValue.storageProfile,
      sizeMB: this.storageChangedValue.storageMB,
      powerState: this.server.powerState
    };

    this._resetDiskValues();
    this._serverService.createServerStorage(this.server.id, storageData).subscribe();
  }

  /**
   * This will process the update for the selected disk
   */
  public onClickUpdate(): void {
    if (!this.isValidStorageValues || this.expandingStorage
      || this.storageScaleIsDisabled) { return; }

    this.expandingStorage = true;
    this.mcsStorage.completed();

    let storageData = new ServerStorageDeviceUpdate();
    storageData.name = this.selectedStorageDevice.name;
    storageData.storageProfile = this.selectedStorageDevice.storageProfile;
    storageData.sizeMB = this.storageChangedValue.storageMB;
    storageData.clientReferenceObject = {
      serverId: this.server.id,
      diskId: this.selectedStorageDevice.id,
      name: this.selectedStorageDevice.name,
      storageProfile: this.selectedStorageDevice.storageProfile,
      sizeMB: this.storageChangedValue.storageMB,
      powerState: this.server.powerState
    };

    this._resetDiskValues();
    this._serverService.updateServerStorage(
      this.server.id,
      this.selectedStorageDevice.id,
      storageData
    ).subscribe();
  }

  /**
   * This will process the deletion of the selected disk
   *
   * @param storage Disk to be deleted
   */
  public onDeleteStorage(storage: ServerStorageDevice): void {
    if (this.storageScaleIsDisabled) { return; }

    this.mcsStorage.completed();

    let storageData = new ServerStorageDeviceUpdate();
    storageData.clientReferenceObject = {
      serverId: this.server.id,
      diskId: storage.id,
      powerState: this.server.powerState
    };

    this._serverService.deleteServerStorage(this.server.id, storage.id, storageData).subscribe();
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

  public isPrimaryStorage(storage: ServerStorageDevice): boolean {
    return storage.name === PRIMARY_STORAGE_NAME;
  }

  protected serverSelectionChanged(): void {
    if (!isNullOrEmpty(this._serversRepository)) {
      this._serversRepository.setServerDisks(this.server);
    }
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
    this._createServerDiskSubscription = this._notificationEvents.createServerDisk
      .subscribe(this._onCreateServerDisk.bind(this));
    this._updateServerDiskSubscription = this._notificationEvents.updateServerDisk
      .subscribe(this._onCreateServerDisk.bind(this));
    this._deleteServerDiskSubscription = this._notificationEvents.deleteServerDisk
      .subscribe(this._onDeleteServerDisk.bind(this));
  }

  /**
   * Unregister jobs/notifications events
   */
  private _unregisterJobEvents(): void {
    if (!isNullOrEmpty(this._createServerDiskSubscription)) {
      this._createServerDiskSubscription.unsubscribe();
    }

    if (!isNullOrEmpty(this._updateServerDiskSubscription)) {
      this._updateServerDiskSubscription.unsubscribe();
    }

    if (!isNullOrEmpty(this._deleteServerDiskSubscription)) {
      this._deleteServerDiskSubscription.unsubscribe();
    }
  }

  /**
   * Event that emits when creating a server disk
   * @param job Emitted job content
   */
  private _onCreateServerDisk(job: McsApiJob): void {
    if (isNullOrEmpty(job) || isNullOrEmpty(job.clientReferenceObject)) { return; }

    if (job.status === CoreDefinition.NOTIFICATION_JOB_COMPLETED) {
      // Update resource values
      let resourceStorage = this._getStorageByProfile(job.clientReferenceObject.storageProfile);
      if (!isNullOrEmpty(resourceStorage)) {
        resourceStorage.usedMB += job.clientReferenceObject.sizeMB;
      }
    }
  }

  /**
   * Event that emits when deleting a server disk
   * @param job Emitted job content
   */
  private _onDeleteServerDisk(job: McsApiJob): void {
    if (isNullOrEmpty(job) || isNullOrEmpty(job.clientReferenceObject)) { return; }

    if (job.status === CoreDefinition.NOTIFICATION_JOB_COMPLETED) {
      // Update resource values
      let resourceStorage = this._getStorageByProfile(job.clientReferenceObject.storageProfile);
      if (!isNullOrEmpty(resourceStorage)) {
        resourceStorage.usedMB -= job.clientReferenceObject.sizeMB;
      }
    }
  }

  private _resetDiskValues(): void {
    this.storageChangedValue = new ServerManageStorage();
    let storage = new ServerManageStorage();
    storage.storageProfile = this._storageProfile;
    storage.storageMB = 0;
    storage.valid = false;
    this.onStorageChanged(storage);
  }

  /**
   * Listen to notifications changes
   */
  private _listenToNotificationsChange(): void {
    this._notificationsChangeSubscription = this._serversRepository.notificationsChanged
      .subscribe(() => {
        this._changeDetectorRef.markForCheck();
      });
  }
}
