import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';
import {
  Server,
  ServerFileSystem,
  ServerManageStorage,
  ServerPlatform,
  ServerResource,
  ServerStorage,
  ServerStorageDevice,
  ServerStorageDeviceUpdate
} from '../../models';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsList,
  McsListItem
} from '../../../../core';
import { ServerService } from '../server.service';
import {
  appendUnitSuffix,
  convertToGb,
  animateFactory
} from '../../../../utilities';

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
  public deleteStorageAlertMessage: string;

  public serverSubscription: any;
  public server: Server;
  public storageDevices: ServerStorageDevice[];
  public storageProfileList: McsList;

  public newStorageDevice: ServerStorageDevice;
  public selectedStorageDevice: ServerStorageDevice;

  public serverPlatformSubscription: any;
  public serverPlatformData: ServerPlatform;
  public serverPlatformStorage: ServerStorage[];

  public storageChangedValue: ServerManageStorage;

  public get storageIconKey(): string {
    return CoreDefinition.ASSETS_SVG_STORAGE;
  }

  public get hasstorageDevice(): boolean {
    return this.storageDevices.length > 0;
  }

  constructor(
    private _textProvider: McsTextContentProvider,
    private _serverService: ServerService
  ) {
    // Constructor
    this.expandStorage = false;
    this.deleteStorageAlertMessage = '';
    this.server = new Server();
    this.storageDevices = new Array<ServerStorageDevice>();
    this.storageProfileList = new McsList();
    this.selectedStorageDevice = new ServerStorageDevice();
    this.newStorageDevice = new ServerStorageDevice();
    this.newStorageDevice.storageProfile = '';
    this.newStorageDevice.sizeMB = 0;
    this.serverPlatformData = new ServerPlatform();
    this.serverPlatformStorage = new Array<ServerStorage>();
    this.storageChangedValue = new ServerManageStorage();
    this.storageChangedValue.valid = false;
  }

  public ngOnInit() {
    // OnInit
    this.serverStorageText = this._textProvider.content.servers.server.storage;
    this.deleteStorageAlertMessage = this.serverStorageText.deleteStorageAlertMessage;

    this.serverSubscription = this._serverService.selectedServerStream
      .subscribe((server) => {
        if (server) {
          this.server = server;
          this.storageDevices = server.storageDevice;
          this.storageProfileList = this._getStorageProfiles(this.storageDevices);
          this._initializePlatformData();
        }
      });
  }

  public getDeleteStorageAlertMessage(storage: ServerFileSystem): string {
    return this.deleteStorageAlertMessage.replace('{{volume_name}}', storage.path);
  }

  public onStorageChanged(serverStorage: ServerManageStorage) {
    this.storageChangedValue = serverStorage;
    this.newStorageDevice.storageProfile = serverStorage.storageProfile;
  }

  public onExpandStorage(storageDevice: ServerStorageDevice) {
    this.selectedStorageDevice = storageDevice;
    this.expandStorage = true;
  }

  public closeExpandStorageBox() {
    this.selectedStorageDevice = new ServerStorageDevice();
    this.expandStorage = false;
  }

  public getStorageAvailableMemory(storageDevice: ServerStorageDevice): number {
    if (this.serverPlatformStorage.length === 0) { return; }

    let storage = this.serverPlatformStorage
      .find((result) => {
        return result.name === storageDevice.storageProfile;
      });

    return storage.limitMB - storage.usedMB;
  }

  public convertStorageInGb(value: number): number {
    return Math.floor(convertToGb(value));
  }

  public appendGbUnit(value: number): string {
    return `${value} ${this.serverStorageText.unit}`;
  }

  public onClickAttach(): void {
    if (!this.storageChangedValue.valid) { return; }

    let storageDeviceUpdate = new ServerStorageDeviceUpdate();
    storageDeviceUpdate.storageProfile = this.storageChangedValue.storageProfile;
    storageDeviceUpdate.sizeMB = this.storageChangedValue.storageMB;
    storageDeviceUpdate.clientReferenceObject = { activeServerId: this.server.id };

    this._serverService.setStorageDeviceUpdate(this.server.id, storageDeviceUpdate)
      .subscribe((response) => { console.log(response); });
  }

  public onClickUpdate(): void {
    if (!this.storageChangedValue.valid) { return; }

    let storageDeviceUpdate = new ServerStorageDeviceUpdate();
    storageDeviceUpdate.name = this.selectedStorageDevice.name;
    storageDeviceUpdate.storageProfile = this.storageChangedValue.storageProfile;
    storageDeviceUpdate.sizeMB = this.storageChangedValue.storageMB;
    storageDeviceUpdate.clientReferenceObject = { activeServerId: this.server.id };

    this._serverService.setStorageDeviceUpdate(this.server.id, storageDeviceUpdate)
      .subscribe((response) => { this.expandStorage = false; });
  }

  public ngOnDestroy() {
    if (this.serverSubscription) {
      this.serverSubscription.unsubscribe();
    }

    if (this.serverPlatformSubscription) {
      this.serverPlatformSubscription.unsubscribe();
    }
  }

  private _getStorageProfiles(storageDevice: ServerStorageDevice[]): McsList {
    if (!storageDevice) { return; }

    let storageProfileList = new McsList();

    for (let storage of storageDevice) {
      storageProfileList.push('Storage Profiles',
        new McsListItem(storage.storageProfile, storage.storageProfile));
    }

    return storageProfileList;
  }

  private _initializePlatformData(): void {
    this.serverPlatformSubscription = this._serverService.getPlatformData()
      .subscribe((data) => {
        this.serverPlatformData = data.content;
        this.serverPlatformStorage = this._getServerPlatformStorage();
      });
  }

  private _getServerPlatformStorage(): ServerStorage[] {
    let serverResource = new ServerResource();

    for (let environment of this.serverPlatformData.environments) {
      serverResource = environment.resources.find((result) => {
        return result.serviceType === this.server.serviceType
          && result.name === this.server.vdcName;
      });

      if (serverResource) {
        break;
      }
    }

    return serverResource.storage;
  }
}
