import {
  Component,
  OnInit,
  Input
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

@Component({
  selector: 'mcs-server-storage',
  styles: [require('./server-storage.component.scss')],
  templateUrl: './server-storage.component.html'
})

export class ServerStorageComponent implements OnInit {
  public server: Server;
  public primaryStorage: any;
  public otherStorage: ServerFileSystem[];
  public storageIconKey: string;
  public serverStorageText: any;
  public increaseStorage: boolean;
  public deleteStorageAlertMessage: string;

  public storageMemoryInGb: number;
  public storageAvailableMemoryInGb: number;
  public storageProfileItems: McsList;

  public selectedStorage: ServerFileSystem;

  public get hasOtherStorage(): boolean {
    return this.otherStorage.length > 0;
  }

  constructor(
    private _route: ActivatedRoute,
    private _textProvider: McsTextContentProvider
  ) {
    // Constructor
    this.otherStorage = new Array<ServerFileSystem>();
    this.increaseStorage = false;
    this.deleteStorageAlertMessage = '';
  }

  public ngOnInit() {
    // OnInit
    this.server = this._route.parent.snapshot.data.server.content;
    this.primaryStorage = this.server.fileSystem[0];
    this.otherStorage = this.server.fileSystem.slice(1);
    this.storageIconKey = CoreDefinition.ASSETS_SVG_STORAGE;
    this.serverStorageText = this._textProvider.content.servers.server.storage;
    this.deleteStorageAlertMessage = this.serverStorageText.deleteStorageAlertMessage;
    this.storageMemoryInGb = 200;
    this.storageAvailableMemoryInGb = this.getTotalStorageFreeSpace();
    this.storageProfileItems = this.getStorageProfiles();
  }

  public getDeleteStorageAlertMessage(storage: ServerFileSystem): string {
    return this.deleteStorageAlertMessage.replace('{{volume_name}}', storage.path);
  }

  public getTotalStorageFreeSpace(): number {
    let total: number;

    for (let storage of this.server.fileSystem) {
      total += storage.freeSpaceInGb;
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
}
