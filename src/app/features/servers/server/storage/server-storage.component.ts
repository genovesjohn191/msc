import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { Observable } from 'rxjs/Rx';
import {
  Server,
  ServerFileSystem,
  ServerManageStorage,
  ServerPlatform,
  ServerResource,
  ServerStorage,
  ServerStorageDevice,
  ServerStorageDeviceUpdate,
} from '../../models';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsList,
  McsListItem,
  McsNotificationContextService,
  McsApiJob,
  McsJobType,
  McsLoader,
  McsModal
} from '../../../../core';
import { ServerService } from '../server.service';
import {
  appendUnitSuffix,
  convertToGb,
  animateFactory,
  mergeArrays,
  updateArrayRecord,
  isNullOrEmpty,
  replacePlaceholder
} from '../../../../utilities';

import { McsStorage } from '../../shared';

const STORAGE_SLIDER_STEP_DEFAULT = 25;
const STORAGE_MAXIMUM_DISKS = 14;
const STORAGE_MINIMUM_VALUE = 1024;
const PRIMARY_STORAGE_NAME = 'Hard disk 1';

@Component({
  selector: 'mcs-server-storage',
  styles: [require('./server-storage.component.scss')],
  templateUrl: './server-storage.component.html',
  animations: [
    animateFactory({ duration: '500ms' })
  ]
})

export class ServerStorageComponent implements OnInit, OnDestroy {
  @ViewChild('mcsStorage')
  public mcsStorage: McsStorage;

  @ViewChild('attachButton')
  public attachButton: McsLoader;

  @ViewChild('updateButton')
  public updateButton: McsLoader;

  @ViewChild('deleteButton')
  public deleteButton: McsLoader;

  public serverStorageText: any;
  public expandStorage: boolean;
  public expandingStorage: boolean;
  public deletingStorage: boolean;
  public deleteStorageAlertMessage: string;

  public serverSubscription: any;
  public serverStorageSubscription: any;
  public server: Server;
  public storageDevices: ServerStorageDevice[];

  public serverPlatformSubscription: any;
  public serverPlatformData: ServerPlatform;
  public serverPlatformStorage: ServerStorage[];

  public storageChangedValue: ServerManageStorage;

  public notificationsSubscription: any;
  public notifications: McsApiJob[];

  public storageProfileList: McsList;
  public newStorageSliderValues: number[];
  public memoryMB: number;
  public availableMemoryMB: number;
  public minimumMB: number;
  public usedMemoryMB: number;

  public selectedStorageDevice: ServerStorageDevice;
  public selectedStorageSliderValues: number[];

  public isLoadingStorage: boolean;

  public disabled: boolean;

  public deleteStorageModal: McsModal;

  public get storageIconKey(): string {
    return CoreDefinition.ASSETS_SVG_STORAGE;
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_FONT_WARNING;
  }

  public get hasStorageDevice(): boolean {
    return !isNullOrEmpty(this.storageDevices);
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

  public get isLoading(): boolean {
    return !this.hasStorageDevice || !this.storageProfileList;
  }

  /**
   * Server platform data mapping
   */
  private _serverPlatformMap: Map<string, ServerResource>;
  public get serverPlatformMap(): Map<string, ServerResource> {
    return this._serverPlatformMap;
  }

  constructor(
    private _textProvider: McsTextContentProvider,
    private _serverService: ServerService,
    private _notificationContextService: McsNotificationContextService
  ) {
    // Constructor
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
    this.serverPlatformData = new ServerPlatform();
    this.serverPlatformStorage = new Array<ServerStorage>();
    this.storageChangedValue = new ServerManageStorage();
    this.storageChangedValue.valid = false;
    this.notifications = new Array<McsApiJob>();
    this._serverPlatformMap = new Map<string, ServerResource>();
    this.isLoadingStorage = true;
    this.disabled = false;
  }

  public ngOnInit() {
    // OnInit
    this.serverStorageText = this._textProvider.content.servers.server.storage;
    this.deleteStorageAlertMessage = this.serverStorageText.deleteStorageAlertMessage;

    this._listenToServerPlatformData();
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
  }

  public onExpandStorage(storageDevice: ServerStorageDevice) {
    this.selectedStorageDevice = storageDevice;
    this.expandStorage = true;
    this._setSelectedStorageSliderValues();
  }

  public closeExpandStorageBox() {
    if (this.disabled) { return; }
    this.selectedStorageDevice = new ServerStorageDevice();
    this.expandStorage = false;
  }

  public setModalInstance(mcsModal: McsModal): void {
    if (!mcsModal) { return; }
    this.deleteStorageModal = mcsModal;
  }

  public closeDeleteStorageModal(): void {
    if (this.deletingStorage) { return; }
    this.deleteStorageModal.close();
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

    this.disabled = true;
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
      sizeMB: this.storageChangedValue.storageMB
    };

    this.storageChangedValue = new ServerManageStorage();
    this._serverService.createServerStorage(this.server.id, storageData).subscribe();
  }

  public onClickUpdate(): void {
    if (!this.isValidStorageValues || this.expandingStorage) { return; }

    this.expandingStorage = true;
    this.disabled = true;
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
      sizeMB: this.storageChangedValue.storageMB
    };

    this._serverService.updateServerStorage(
      this.server.id,
      this.selectedStorageDevice.id,
      storageData
    ).subscribe();
  }

  public onDeleteStorage(storage: ServerStorageDevice): void {
    if (this.deletingStorage) { return; }

    this.deletingStorage = true;
    this.deleteButton.showLoader();

    this._serverService.deleteServerStorage(this.server.id, storage.id)
      .subscribe((response) => { this.disabled = true; });
  }

  public getStorageAvailableMemory(storageProfile: string): number {
    let availableMemoryMB = 0;

    let storage = this.serverPlatformStorage
      .find((result) => {
        return result.name === storageProfile;
      });

    if (storage) {
      availableMemoryMB = storage.limitMB - storage.usedMB;
      if (availableMemoryMB < 0) { availableMemoryMB = 0; }
    }

    return availableMemoryMB;
  }

  public getStorageStatus(diskId: string) {
    if (this.notifications.length === 0) { return; }

    let storageStatus = '';
    let response = new McsApiJob();

    response = this.notifications.find((notification) => {
      return (notification.clientReferenceObject &&
        notification.clientReferenceObject.diskId === diskId &&
        (notification.status === CoreDefinition.NOTIFICATION_JOB_PENDING
          || notification.status === CoreDefinition.NOTIFICATION_JOB_ACTIVE));
    });

    if (response) {
      storageStatus = response.summaryInformation;
    }

    return storageStatus;
  }

  public isPrimaryStorage(storage: ServerStorageDevice): boolean {
    return storage.name === PRIMARY_STORAGE_NAME;
  }

  public ngOnDestroy() {
    if (this.serverSubscription) {
      this.serverSubscription.unsubscribe();
    }

    if (this.serverPlatformSubscription) {
      this.serverPlatformSubscription.unsubscribe();
    }

    if (this.notificationsSubscription) {
      this.notificationsSubscription.unsubscribe();
    }

    if (this.serverStorageSubscription) {
      this.serverStorageSubscription.unsubscribe();
    }
  }

  private _listenToServerPlatformData(): void {
    this.serverPlatformSubscription = this._serverService.getPlatformData()
      .subscribe((data) => {
        this._setPlatformData(data);
        this._initializeValues();
      });
  }

  private _listenToSelectedServerStream(): void {
    this.serverSubscription = this._serverService.selectedServerStream
      .subscribe((server) => {
        if (server) {
          this.server = server;
          this._setStorageDevices();
          this._initializeValues();
        }
      });
  }

  private _listenToNotificationsStream(): void {
    this.notificationsSubscription = this._notificationContextService.notificationsStream
      .subscribe((notifications) => {
        if (notifications && this.server) {
          let storageJobs = notifications.filter((job) => {
            return (job.type === McsJobType.CreateServerDisk ||
              job.type === McsJobType.UpdateServerDisk ||
              job.type === McsJobType.DeleteServerDisk) &&
              (job.clientReferenceObject && job.clientReferenceObject.serverId === this.server.id);
          });

          if (!isNullOrEmpty(storageJobs)) {
            this._listenToServerPlatformData();
            this.disabled = true;
            this.notifications = mergeArrays(this.notifications, storageJobs,
              (_first: McsApiJob, _second: McsApiJob) => {
                return _first.id === _second.id;
              });

            for (let job of this.notifications) {
              if (job.status === CoreDefinition.NOTIFICATION_JOB_FAILED) {
                this.disabled = false;
                break;
              }

              switch (job.type) {
                case McsJobType.UpdateServerDisk:
                  if (this.updateButton) {
                    this.updateButton.hideLoader();
                    this.expandingStorage = false;
                    this.expandStorage = false;
                  }
                  if (job.status !== CoreDefinition.NOTIFICATION_JOB_COMPLETED) { break; }

                case McsJobType.CreateServerDisk:
                  if (this.attachButton) { this.attachButton.hideLoader(); }

                  // Update the available memory when completed
                  if (job.status === CoreDefinition.NOTIFICATION_JOB_COMPLETED) {
                    this.availableMemoryMB -= this.usedMemoryMB;
                    this._setNewStorageSliderValues();
                    this._setSelectedStorageSliderValues();
                    this.usedMemoryMB = 0;
                    this.disabled = false;
                  }

                  // Append Create Server Disk / Update Disk Data
                  let disk = new ServerStorageDevice();
                  // TODO: This will be provided by the API
                  if (job.clientReferenceObject.diskId) {
                    disk.id = job.clientReferenceObject.diskId;
                  }
                  disk.name = job.clientReferenceObject.name;
                  disk.storageProfile = job.clientReferenceObject.storageProfile;
                  disk.sizeMB = job.clientReferenceObject.sizeMB;

                  updateArrayRecord(this.storageDevices, disk, true,
                    (_first: any, _second: any) => {
                      return _first.id === _second.id;
                    });
                  break;

                case McsJobType.DeleteServerDisk:
                  // Delete Disk
                  if (this.deleteStorageModal) {
                    this.deletingStorage = false;
                    this.deleteStorageModal.close();
                  }

                  // TODO: Create utility for deleting array record
                  if (job.status === CoreDefinition.NOTIFICATION_JOB_COMPLETED) {
                    let deletedDiskIndex = this.storageDevices.findIndex(
                      (storage) => storage.id === job.clientReferenceObject.diskId
                    );

                    if (deletedDiskIndex >= 0) {
                      this.availableMemoryMB += this.storageDevices[deletedDiskIndex].sizeMB;
                      this._setNewStorageSliderValues();
                      this.storageDevices.splice(deletedDiskIndex, 1);
                      this.disabled = false;
                    }
                  }
                  break;

                default:
                  // Do nothing
                  break;
              }
            }
          }
        }
      });
  }

  private _setStorageDevices(): void {
    if (isNullOrEmpty(this.server)) { return; }

    this.isLoadingStorage = true;
    this.serverStorageSubscription = this._serverService.getServerStorage(this.server.id)
      .subscribe((storage) => {
        this.storageDevices = storage.content;
        this.isLoadingStorage = false;
      });
  }

  private _initializeValues(): void {
    if (!this.server || this._serverPlatformMap.size === 0) { return; }
    this._setServerPlatformStorage();
    this._setStorageProfiles();
  }

  /**
   * This will set the Platform data to platform mapping
   * for easily access across its chidren component
   *
   * `@Note` This will execute together with the servers and template obtainment
   * @param response Api response
   */
  private _setPlatformData(response: any): void {
    if (response && response.content) {
      let serverPlatform = response.content as ServerPlatform;
      serverPlatform.environments.forEach((environment) => {
        environment.resources.forEach((resource) => {
          this._serverPlatformMap.set(resource.name, resource);
        });
      });
    }
  }

  private _setServerPlatformStorage(): void {
    this.serverPlatformStorage.splice(0);

    if (this._serverPlatformMap.has(this.server.vdcName)) {
      let serverResource = this._serverPlatformMap.get(this.server.vdcName);
      this.serverPlatformStorage = serverResource.storage;
    }
  }

  private _setStorageProfiles(): void {
    let storageProfileList = new McsList();

    this.serverPlatformStorage.forEach((storage) => {
      storageProfileList.push('Storage Profiles',
        new McsListItem(storage.name, storage.name));
    });

    this.storageProfileList = storageProfileList;
  }

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

  private _setNewStorageSliderValues(): void {
    if (isNullOrEmpty(this.availableMemoryMB)) { return; }
    this.newStorageSliderValues = this._getStorageSliderValues(
      this.memoryMB, this.availableMemoryMB
    );
  }

  private _setSelectedStorageSliderValues(): void {
    if (isNullOrEmpty(this.availableMemoryMB)) { return; }
    this.selectedStorageSliderValues = this._getStorageSliderValues(
      this.selectedStorageDevice.sizeMB, this.availableMemoryMB
    );
  }

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
