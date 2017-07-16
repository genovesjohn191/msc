import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';
import {
  Server,
  ServerFileSystem,
  ServerManageStorage
} from '../../models';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsList,
  McsListItem
} from '../../../../core';
import { ServerService } from '../server.service';

@Component({
  selector: 'mcs-server-storage',
  styles: [require('./server-storage.component.scss')],
  templateUrl: './server-storage.component.html'
})

export class ServerStorageComponent implements OnInit, OnDestroy {
  public server: Server;
  public primaryStorage: any;
  public otherStorage: ServerFileSystem[];
  public serverStorageText: any;
  public increaseStorage: boolean;
  public deleteStorageAlertMessage: string;

  public storageMemoryInGb: number;
  public storageAvailableMemoryInGb: number;
  public storageProfileItems: McsList;

  public selectedStorage: ServerFileSystem;

  public subscription: any;

  public get storageIconKey(): string {
    return CoreDefinition.ASSETS_SVG_STORAGE;
  }

  public get hasStorage(): boolean {
    return this.server.fileSystem && this.server.fileSystem.length > 0;
  }

  public get hasOtherStorage(): boolean {
    return this.otherStorage.length > 0;
  }

  constructor(
    private _textProvider: McsTextContentProvider,
    private _serverService: ServerService
  ) {
    // Constructor
    this.otherStorage = new Array<ServerFileSystem>();
    this.increaseStorage = false;
    this.deleteStorageAlertMessage = '';
  }

  public ngOnInit() {
    // OnInit
    this.subscription = this._serverService.selectedServerStream.subscribe((server) => {
      this.server = server;
      if (this.hasStorage) {
        this.primaryStorage = this.server.fileSystem[0];
        this.otherStorage = this.server.fileSystem.slice(1);
        this.storageAvailableMemoryInGb = this.getTotalStorageFreeSpace();
      }
    });

    this.serverStorageText = this._textProvider.content.servers.server.storage;
    this.deleteStorageAlertMessage = this.serverStorageText.deleteStorageAlertMessage;
    this.storageMemoryInGb = 200;
    this.storageProfileItems = this.getStorageProfiles();
  }

  public getDeleteStorageAlertMessage(storage: ServerFileSystem): string {
    return this.deleteStorageAlertMessage.replace('{{volume_name}}', storage.path);
  }

  public getTotalStorageFreeSpace(): number {
    let total: number;

    for (let storage of this.server.fileSystem) {
      total += storage.freeSpaceGB;
    }

    return total;
  }

  public getStorageProfiles(): McsList {
    // TODO: Set the actual obtainment of real data to be displayed here
    let itemList: McsList = new McsList();

    itemList.push('Storage Profiles', new McsListItem('storageProfile1', 'Storage Profile 1'));
    itemList.push('Storage Profiles', new McsListItem('storageProfile2', 'Storage Profile 2'));
    itemList.push('Storage Profiles', new McsListItem('storageProfile3', 'Storage Profile 3'));
    return itemList;
  }

  public onStorageChanged(serverStorage: ServerManageStorage) {
    // TODO: Set the serverStorage in the official variable
  }

  public onIncreaseStorage(storage: ServerFileSystem) {
    this.selectedStorage = storage;
    this.increaseStorage = true;
  }

  public closeIncreaseStorageBox() {
    this.selectedStorage = new ServerFileSystem();
    this.increaseStorage = false;
  }

  public ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
