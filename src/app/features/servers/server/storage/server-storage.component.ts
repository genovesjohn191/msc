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
  Server,
  ServerManageStorage,
  ServerResource,
  ServerResourceStorage,
  ServerStorageDevice,
  ServerStorageDeviceUpdate,
} from '../../models';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsNotificationContextService,
  McsApiJob,
  McsJobType,
  McsLoader,
  McsDialogService
} from '../../../../core';
import { ServerService } from '../server.service';
import {
  convertToGb,
  addOrUpdateArrayRecord,
  isNullOrEmpty,
  compareStrings,
  deleteArrayRecord
} from '../../../../utilities';

import {
  McsStorage,
  DeleteStorageDialogComponent
} from '../../shared';

const STORAGE_SLIDER_STEP_DEFAULT = 25;
const STORAGE_MAXIMUM_DISKS = 14;
const STORAGE_MINIMUM_VALUE = 1024;
const PRIMARY_STORAGE_NAME = 'Hard disk 1';

@Component({
  selector: 'mcs-server-storage',
  styleUrls: ['./server-storage.component.scss'],
  templateUrl: './server-storage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ServerStorageComponent implements OnInit, OnDestroy {
  @ViewChild('mcsStorage')
  public mcsStorage: McsStorage;

  @ViewChild('attachButton')
  public attachButton: McsLoader;

  @ViewChild('updateButton')
  public updateButton: McsLoader;

  public serverStorageText: any;
  public deleteStorageAlertMessage: string;

  public storageJob: McsApiJob;
  public serverResourceStorage: ServerResourceStorage[];

  public server: Server;
  public storageDevices: ServerStorageDevice[];
  public storageChangedValue: ServerManageStorage;

  public storageProfileList: any[];
  public newStorageSliderValues: number[];
  public memoryMB: number;
  public minimumMB: number;
  public usedMemoryMB: number;

  public selectedStorageDevice: ServerStorageDevice;
  public selectedStorageSliderValues: number[];

  public serverResourceSubscription: Subscription;
  public storageDataSubscription: Subscription;

  private _serverSubscription: Subscription;
  private _notificationsSubscription: Subscription;

  public get storageIconKey(): string {
    return CoreDefinition.ASSETS_SVG_STORAGE;
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_FONT_WARNING;
  }

  public get hasStorageProfileList(): boolean {
    return !isNullOrEmpty(this.storageProfileList);
  }

  public get hasStorageDevice(): boolean {
    return !isNullOrEmpty(this.storageDevices);
  }

  public get hasMultipleStorageDevice(): boolean {
    return this.storageDevices.length > 1;
  }

  public get hasReachedDisksLimit(): boolean {
    return this.storageDevices.length >= STORAGE_MAXIMUM_DISKS;
  }

  public get hasAvailableStorageSpace(): boolean {
    return this.convertStorageInGb(this.availableMemoryMB) > 0;
  }

  public get isValidStorageValues(): boolean {
    return this._validateStorageChangedValues();
  }

  /**
   * Server resource data mapping
   */
  private _serverResourceMap: Map<string, ServerResource>;

  private _availableMemoryMB: number;
  public get availableMemoryMB(): number {
    return this._availableMemoryMB;
  }
  public set availableMemoryMB(value: number) {
    if (this._availableMemoryMB !== value) {
      this._availableMemoryMB = value;
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

  private _isProcessing: boolean;
  public get isProcessing(): boolean {
    return this._isProcessing;
  }
  public set isProcessing(value: boolean) {
    if (this._isProcessing !== value) {
      this._isProcessing = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _textProvider: McsTextContentProvider,
    private _serverService: ServerService,
    private _notificationContextService: McsNotificationContextService,
    private _dialogService: McsDialogService
  ) {
    // Constructor
    this.isProcessing = false;
    this.expandStorage = false;
    this.expandingStorage = false;
    this.deletingStorage = false;
    this.deleteStorageAlertMessage = '';
    this.storageDevices = new Array<ServerStorageDevice>();
    this.selectedStorageDevice = new ServerStorageDevice();
    this.newStorageSliderValues = new Array<number>();
    this.memoryMB = 0;
    this.availableMemoryMB = 0;
    this.minimumMB = STORAGE_MINIMUM_VALUE;
    this.usedMemoryMB = 0;
    this.selectedStorageSliderValues = new Array<number>();
    this.serverResourceStorage = new Array<ServerResourceStorage>();
    this.storageChangedValue = new ServerManageStorage();
    this.storageChangedValue.valid = false;
    this.storageJob = new McsApiJob();
    this._serverResourceMap = new Map<string, ServerResource>();
    this.storageProfileList = new Array();
  }

  public ngOnInit() {
    // OnInit
    this.serverStorageText = this._textProvider.content.servers.server.storage;
    this.deleteStorageAlertMessage = this.serverStorageText.deleteStorageAlertMessage;

    this._getServerResources();
    this._listenToSelectedServerStream();
    this._listenToNotificationsStream();
  }

  public getDeleteStorageAlertMessage(storageDevice: ServerStorageDevice): string {
    return this.deleteStorageAlertMessage.replace('{{disk_name}}', storageDevice.name);
  }

  public onStorageChanged(serverStorage: ServerManageStorage) {
    this.storageChangedValue = serverStorage;
    this.availableMemoryMB = this.getStorageAvailableMemory(serverStorage.storageProfile);
    this._setNewStorageSliderValues();
    this._setSelectedStorageSliderValues();

    if (this.storageDataSubscription) {
      this.storageDataSubscription.unsubscribe();
    }
  }

  public onExpandStorage(storageDevice: ServerStorageDevice) {
    this.selectedStorageDevice = storageDevice;
    this.expandStorage = true;
    this._setSelectedStorageSliderValues();
  }

  public closeExpandStorageBox() {
    if (this.isProcessing) { return; }
    this.selectedStorageDevice = new ServerStorageDevice();
    this.expandStorage = false;
  }

  public deleteStorage(storage: ServerStorageDevice): void {
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
    return `${value} ${this.serverStorageText.unit}`;
  }

  public displayNewDiskName(index: number): string {
    if (index === undefined) { return ''; }

    return `${this.serverStorageText.diskName} ${index + 1}`;
  }

  public onClickAttach(): void {
    if (!this.isValidStorageValues || !this.hasAvailableStorageSpace) { return; }

    this.isProcessing = true;
    this.mcsStorage.completed();
    this.attachButton.showLoader();

    this.usedMemoryMB = this.storageChangedValue.storageMB;

    let storageData = new ServerStorageDeviceUpdate();
    storageData.storageProfile = this.storageChangedValue.storageProfile;
    storageData.sizeMB = this.storageChangedValue.storageMB;
    storageData.clientReferenceObject = {
      serverId: this.server.id,
      name: `${this.serverStorageText.diskName} ${this.storageDevices.length + 1}`,
      storageProfile: this.storageChangedValue.storageProfile,
      sizeMB: this.storageChangedValue.storageMB,
      powerState: this.server.powerState
    };

    this.storageChangedValue = new ServerManageStorage();
    this._serverService.createServerStorage(this.server.id, storageData).subscribe();
  }

  public onClickUpdate(): void {
    if (!this.isValidStorageValues || this.expandingStorage) { return; }

    this.expandingStorage = true;
    this.isProcessing = true;
    this.mcsStorage.completed();
    this.updateButton.showLoader();

    this.usedMemoryMB = this.storageChangedValue.storageMB - this.selectedStorageDevice.sizeMB;

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

    this._serverService.updateServerStorage(
      this.server.id,
      this.selectedStorageDevice.id,
      storageData
    ).subscribe();
  }

  public onDeleteStorage(storage: ServerStorageDevice): void {
    if (this.isProcessing) { return; }

    this.isProcessing = true;

    let storageData = new ServerStorageDeviceUpdate();
    storageData.clientReferenceObject = {
      serverId: this.server.id,
      diskId: storage.id,
      powerState: this.server.powerState
    };

    this._serverService.deleteServerStorage(this.server.id, storage.id, storageData).subscribe();
  }

  public getStorageAvailableMemory(storageProfile: string): number {
    let storage = this._getStorageByProfile(storageProfile);

    return this._serverService.computeAvailableStorageMB(storage);
  }

  public isActiveStorage(diskId: string): boolean {
    return !isNullOrEmpty(this.storageJob.clientReferenceObject) &&
      this.storageJob.clientReferenceObject.diskId === diskId;
  }

  public getStorageSummaryInformation(diskId: string) {
    if (isNullOrEmpty(this.storageJob.clientReferenceObject)) { return; }

    if (this.storageJob.clientReferenceObject.diskId === diskId) {
      return this.storageJob.summaryInformation;
    }
  }

  public isPrimaryStorage(storage: ServerStorageDevice): boolean {
    return storage.name === PRIMARY_STORAGE_NAME;
  }

  public ngOnDestroy() {
    if (this._serverSubscription) {
      this._serverSubscription.unsubscribe();
    }

    if (this.serverResourceSubscription) {
      this.serverResourceSubscription.unsubscribe();
    }

    if (this._notificationsSubscription) {
      this._notificationsSubscription.unsubscribe();
    }
  }

  /**
   * This will get the server resources
   */
  private _getServerResources(): void {
    this.serverResourceSubscription = this._serverService.getResources()
      .subscribe((response) => {
        this._setServerResourceMap(response);
      });

    this.serverResourceSubscription.add(() => {
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * This will listen to the selected server
   * and set values for storage management
   */
  private _listenToSelectedServerStream(): void {
    this._serverSubscription = this._serverService.selectedServerStream
      .subscribe((server) => {
        if (isNullOrEmpty(server)) { return; }

        this.server = server;
        this._setStorageDevices();

        if (!isNullOrEmpty(this.serverResourceSubscription)) {
          this.serverResourceSubscription.add(() => {
            this._setServerResourceStorage();
            this._setStorageProfiles();
          });
        }
      });
  }

  /**
   * This will listen to the ongoing jobs and will update
   * the UI based on the executed storage action/s
   */
  private _listenToNotificationsStream(): void {
    this._notificationsSubscription = this._notificationContextService.notificationsStream
      .subscribe((notifications) => {
        if (notifications && this.server) {
          let serverJob = notifications.find((job) => {
            return job.clientReferenceObject &&
              job.clientReferenceObject.serverId === this.server.id;
          });

          this.isProcessing = !isNullOrEmpty(serverJob) &&
            (serverJob.status === CoreDefinition.NOTIFICATION_JOB_PENDING ||
            serverJob.status === CoreDefinition.NOTIFICATION_JOB_ACTIVE);

          let isStorageJob = !isNullOrEmpty(serverJob) &&
            (serverJob.type === McsJobType.CreateServerDisk ||
            serverJob.type === McsJobType.UpdateServerDisk ||
            serverJob.type === McsJobType.DeleteServerDisk);

          if (isStorageJob) {
            let isCompleted = serverJob.status === CoreDefinition.NOTIFICATION_JOB_COMPLETED;

            if (serverJob.status === CoreDefinition.NOTIFICATION_JOB_FAILED) {
              this.storageJob = new McsApiJob();
              return;
            }

            let disk = new ServerStorageDevice();
            this.storageJob = (isCompleted) ? new McsApiJob() : serverJob ;

            switch (serverJob.type) {
              case McsJobType.UpdateServerDisk:
                if (this.updateButton) {
                  this.updateButton.hideLoader();
                  this.expandingStorage = false;
                  this.expandStorage = false;
                }

                disk.id = serverJob.clientReferenceObject.diskId;
                if (!isCompleted) { break; }

              case McsJobType.CreateServerDisk:
                if (this.attachButton) { this.attachButton.hideLoader(); }

                // Append Create Server Disk / Update Disk Data
                disk.name = serverJob.clientReferenceObject.name;
                disk.storageProfile = serverJob.clientReferenceObject.storageProfile;
                disk.sizeMB = serverJob.clientReferenceObject.sizeMB;

                // Update the available memory when completed
                if (isCompleted) {
                  let resourceStorage = this._getStorageByProfile(disk.storageProfile);
                  resourceStorage.usedMB += this.usedMemoryMB;

                  this._setNewStorageSliderValues();
                  this._setSelectedStorageSliderValues();
                  this.usedMemoryMB = 0;

                  // TODO: This will be provided by the API
                  if (!isNullOrEmpty(serverJob.tasks)) {
                    let referenceObject = serverJob.tasks[0].referenceObject;
                    if (isNullOrEmpty(disk.id) && !isNullOrEmpty(referenceObject.diskId)) {
                      this.storageJob.clientReferenceObject.diskId = referenceObject.diskId;
                      disk.id = referenceObject.diskId;
                    }
                  }
                }

                addOrUpdateArrayRecord(this.storageDevices, disk, false,
                  (_first: any, _second: any) => {
                    return _first.id === _second.id;
                  });
                break;

              case McsJobType.DeleteServerDisk:
                // Delete Disk
                if (isCompleted) {
                  disk = this.storageDevices.find((storage) => {
                    return storage.id === serverJob.clientReferenceObject.diskId;
                  });

                  if (!isNullOrEmpty(disk)) {
                    let resourceStorage = this._getStorageByProfile(disk.storageProfile);
                    resourceStorage.usedMB -= disk.sizeMB;

                    deleteArrayRecord(this.storageDevices, (storage) => {
                      return storage.id === disk.id;
                    });
                  }
                }
                break;

              default:
                // Do nothing
                break;
            }

            if (isCompleted) {
              let storage = new ServerManageStorage();
              storage.storageProfile = disk.storageProfile;
              storage.storageMB = 0;
              storage.valid = false;
              this.onStorageChanged(storage);
            }
          }

          this._changeDetectorRef.markForCheck();
        }
      });
  }

  /**
   * This will set the Platform data to platform mapping
   *
   * @param response Api response
   */
  private _setServerResourceMap(response: any): void {
    if (response && response.content) {
      let serverResources = response.content as ServerResource[];
      serverResources.forEach((resource) => {
        this._serverResourceMap.set(resource.name, resource);
      });
    }
  }

  /**
   * This will set the storage devices of the selected server
   */
  private _setStorageDevices(): void {
    if (isNullOrEmpty(this.server.storageDevice)) { return; }

    this.storageDevices = this.server.storageDevice;
    this.storageDevices.sort(
      (_first: ServerStorageDevice, _second: ServerStorageDevice) => {
        return compareStrings(_first.name, _second.name);
      }
    );
  }

  /**
   * This will set the storage from the platform data
   */
  private _setServerResourceStorage(): void {
    if (isNullOrEmpty(this.server.environment) ||
      isNullOrEmpty(this.server.environment.resource)) { return; }

    let resourceName = this.server.environment.resource.name;

    if (this._serverResourceMap.has(resourceName)) {
      let serverResource = this._serverResourceMap.get(resourceName);
      this.serverResourceStorage = serverResource.storage;
    }
  }

  /**
   * This will set the storage profiles for storage management
   */
  private _setStorageProfiles(): void {
    if (isNullOrEmpty(this.serverResourceStorage)) { return; }

    this.serverResourceStorage.forEach((storage) => {
      this.storageProfileList.push({ value: storage.name, text: storage.name });
    });
  }

  /**
   * This will return the resource storage
   * where the provided storage profile belongs
   *
   * @param profile Storage profile
   */
  private _getStorageByProfile(profile: string): ServerResourceStorage {
    if (isNullOrEmpty(this.serverResourceStorage)) { return; }

    return this.serverResourceStorage.find((storage) => {
      return storage.name === profile;
    });
  }

  /**
   * This will return the slider values based
   * on the memoryMB and availableMemory
   * of the currently selected storage profile
   *
   * @param memoryMB Initial or Minimum value of the slider
   * @param availableMemoryMB Available memory of the storage profile
   */
  private _getStorageSliderValues(memoryMB: number, availableMemoryMB: number): number[] {
    let memoryGB = Math.floor(convertToGb(memoryMB));
    let maximumMemoryGB = memoryGB + Math.floor(convertToGb(availableMemoryMB));
    let storageSliderValues = new Array<number>();

    storageSliderValues.push(memoryGB);
    for (let value = memoryGB; value < maximumMemoryGB;) {
      if ((value + STORAGE_SLIDER_STEP_DEFAULT) <= maximumMemoryGB) {
        value += STORAGE_SLIDER_STEP_DEFAULT;
      } else {
        value = maximumMemoryGB;
      }

      storageSliderValues.push(value);
    }

    return storageSliderValues;
  }

  /**
   * This will set the slider values for
   * the new storage to be added
   */
  private _setNewStorageSliderValues(): void {
    if (isNullOrEmpty(this.availableMemoryMB)) { return; }
    this.newStorageSliderValues = this._getStorageSliderValues(
      this.memoryMB, this.availableMemoryMB
    );
  }

  /**
   * This will set the slider values for
   * the storage to be expanded
   */
  private _setSelectedStorageSliderValues(): void {
    if (isNullOrEmpty(this.availableMemoryMB)) { return; }
    this.selectedStorageSliderValues = this._getStorageSliderValues(
      this.selectedStorageDevice.sizeMB, this.availableMemoryMB
    );
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
      isValid = this.storageChangedValue.storageMB > this.memoryMB
        && this.storageChangedValue.valid;
    }

    return isValid;
  }
}
