import {
  Component,
  OnInit,
  OnDestroy
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
  McsJobType
} from '../../../../core';
import { ServerService } from '../server.service';
import {
  appendUnitSuffix,
  convertToGb,
  animateFactory,
  mergeArrays,
  isNullOrEmpty
} from '../../../../utilities';

const STORAGE_SLIDER_STEP_DEFAULT = 25;
const STORAGE_MAXIMUM_DISKS = 14;

@Component({
  selector: 'mcs-server-storage',
  styles: [require('./server-storage.component.scss')],
  templateUrl: './server-storage.component.html',
  animations: [
    animateFactory({ duration: '500ms' })
  ]
})

export class ServerStorageComponent implements OnInit, OnDestroy {
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

  public selectedStorageDevice: ServerStorageDevice;
  public selectedStorageSliderValues: number[];

  public isLoadingStorage: boolean;

  public get storageIconKey(): string {
    return CoreDefinition.ASSETS_SVG_STORAGE;
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_FONT_SPINNER;
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
    this.minimumMB = 1024;
    this.selectedStorageSliderValues = new Array<number>();
    this.serverPlatformData = new ServerPlatform();
    this.serverPlatformStorage = new Array<ServerStorage>();
    this.storageChangedValue = new ServerManageStorage();
    this.storageChangedValue.valid = false;
    this.notifications = new Array<McsApiJob>();
    this._serverPlatformMap = new Map<string, ServerResource>();
    this.isLoadingStorage = true;
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
    this.newStorageSliderValues = this._getStorageSliderValues(
      this.memoryMB, this.availableMemoryMB
    );
  }

  public onExpandStorage(storageDevice: ServerStorageDevice) {
    this.selectedStorageDevice = storageDevice;
    this.expandStorage = true;
    this.selectedStorageSliderValues = this._getStorageSliderValues(
      this.selectedStorageDevice.sizeMB,
      this.getStorageAvailableMemory(this.selectedStorageDevice.storageProfile)
    );
  }

  public closeExpandStorageBox() {
    this.selectedStorageDevice = new ServerStorageDevice();
    this.expandStorage = false;
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

  public onClickAttach(attachButton: any): void {
    if (!this.isValidStorageValues) { return; }

    let storageData = new ServerStorageDeviceUpdate();
    storageData.storageProfile = this.storageChangedValue.storageProfile;
    storageData.sizeMB = this.storageChangedValue.storageMB;
    storageData.clientReferenceObject = {
      serverId: this.server.id,
      storageProfile: this.storageChangedValue.storageProfile,
      sizeMB: this.storageChangedValue.storageMB
    };

    this.availableMemoryMB -= this.storageChangedValue.storageMB;
    attachButton.showLoader();
    this.storageChangedValue = new ServerManageStorage();
    this._serverService.createServerStorage(this.server.id, storageData)
      .subscribe(() => {
        attachButton.hideLoader();
      });
  }

  public onClickUpdate(updateButton: any): void {
    if (!this.isValidStorageValues || this.expandingStorage) { return; }

    let storageData = new ServerStorageDeviceUpdate();
    storageData.name = this.selectedStorageDevice.name;
    storageData.storageProfile = this.selectedStorageDevice.storageProfile;
    storageData.sizeMB = this.storageChangedValue.storageMB;
    storageData.clientReferenceObject = {
      serverId: this.server.id,
      diskId: this.selectedStorageDevice.id
    };

    this.expandingStorage = true;
    updateButton.showLoader();
    this._serverService.updateServerStorage(
      this.server.id,
      this.selectedStorageDevice.id,
      storageData
    ).subscribe(() => {
      this.expandingStorage = false;
      this.expandStorage = false;
    });
  }

  public onDeleteStorage(
    storage: ServerStorageDevice,
    mcsModal: any,
    deleteButton: any
  ): void {
    if (this.deletingStorage) { return; }

    this.deletingStorage = true;
    deleteButton.showLoader();
    this._serverService.deleteServerStorage(this.server.id, storage.id)
      .subscribe(() => {
        this.deletingStorage = false;
        mcsModal.close();
      });
  }

  public getStorageAvailableMemory(storageProfile: string): number {
    let availableMemoryMB = 0;

    let storage = this.serverPlatformStorage
      .find((result) => {
        return result.name === storageProfile;
      });

    if (storage) {
      availableMemoryMB = storage.limitMB - storage.usedMB;
    }

    return availableMemoryMB;
  }

  public getStorageStatus(diskId: string) {
    if (this.notifications.length === 0) { return; }

    let storageStatus = '';
    let response = new McsApiJob();

    response = this.notifications.find((notification) => {
      return (notification.clientReferenceObject &&
        notification.clientReferenceObject.diskId === diskId);
    });

    if (response) {
      storageStatus = response.summaryInformation;
    }

    return storageStatus;
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
          let storageNotifications = notifications.filter((notification) => {
            return (notification.status === CoreDefinition.NOTIFICATION_JOB_PENDING ||
              notification.status === CoreDefinition.NOTIFICATION_JOB_ACTIVE) &&
              (notification.clientReferenceObject &&
              notification.clientReferenceObject.serverId === this.server.id);
          });

          this.notifications = (storageNotifications) ?
            storageNotifications : new Array<McsApiJob>();

          this._appendCreatedDisks();
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

  private _appendCreatedDisks(): void {
    let disks = new Array<ServerStorageDevice>();

    let filteredNotifications = this.notifications.filter((notification) => {
      return notification.type === McsJobType.CreateServerDisk
        && notification.status !== CoreDefinition.NOTIFICATION_JOB_FAILED;
    });

    if (filteredNotifications) {
      filteredNotifications.forEach((notification) => {
        let disk = new ServerStorageDevice();
        disk.storageProfile = notification.clientReferenceObject.storageProfile;
        disk.sizeMB = notification.clientReferenceObject.sizeMB;

        disks.push(disk);
      });
    }

    this.storageDevices = mergeArrays(this.server.storageDevice, disks);
  }

  private _validateStorageChangedValues(): boolean {
    let isValid: boolean = false;

    if (this.expandStorage) {
      isValid = this.storageChangedValue.storageMB > this.selectedStorageDevice.sizeMB;
    } else {
      isValid = this.storageChangedValue.storageMB > this.memoryMB;
    }

    return isValid;
  }
}
