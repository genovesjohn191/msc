import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChildren,
  QueryList
} from '@angular/core';
import {
  McsList,
  McsListItem,
  McsTextContentProvider,
  CoreDefinition
} from '../../../../core';
import { CreateSelfManagedServerService } from '../create-self-managed-server.service';
import { ContextualHelpDirective } from '../../shared/contextual-help/contextual-help.directive';

@Component({
  selector: 'mcs-copy-self-managed-server',
  templateUrl: './copy-self-managed-server.component.html',
  styles: [require('./copy-self-managed-server.component.scss')]
})

export class CopySelfManagedServerComponent implements OnInit, AfterViewInit {
  public ipAddressValue: string;
  public computeValue: any;
  public storageValue: any;
  public primaryNetworkValue: any;
  public primaryNetworkItems: McsList;

  public serverNameValue: any;
  public serverNameItems: McsList;

  public virtualApplicationValue: any;
  public virtualApplicationItems: McsList;

  public serverCatalogValue: any;
  public serverCatalogItems: McsList;

  public storageProfileValue: any;
  public storageProfileItems: McsList;

  public contextualTextContent: any;

  @ViewChildren(ContextualHelpDirective)
  public contextualHelpDirectives: QueryList<ContextualHelpDirective>;

  public constructor(
    private _managedServerService: CreateSelfManagedServerService,
    private _textContentProvider: McsTextContentProvider
  ) {
  }

  public ngOnInit() {
    this.contextualTextContent = this._textContentProvider.content
      .servers.createSelfManagedServer.contextualHelp;
    this.ipAddressValue = 'next';

    this.primaryNetworkItems = this.getPrimaryNetwork();
    this.serverNameItems = this.getServerNames();
    this.virtualApplicationItems = this.getVirtualApplications();
    this.serverCatalogItems = this.getServerCatalogs();
    this.storageProfileItems = this.getStorageProfiles();
  }

  public ngAfterViewInit() {
    setTimeout(() => {
      if (this.contextualHelpDirectives) {
        let contextInformations: ContextualHelpDirective[];
        contextInformations = this.contextualHelpDirectives
          .map((description) => {
            return description;
          });
        this._managedServerService.contextualHelpStream.next(contextInformations);
      }
    }, CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
  }

  public getServerNames(): McsList {
    // TODO: Set the actual obtainment of real data to be displayed here
    let itemList: McsList = new McsList();

    itemList.push('Server Name', new McsListItem('serverName1', 'Server Name 1'));
    itemList.push('Server Name', new McsListItem('serverName2', 'Server Name 2'));
    itemList.push('Server Name', new McsListItem('serverName3', 'Server Name 3'));
    return itemList;
  }

  public getVirtualApplications(): McsList {
    // TODO: Set the actual obtainment of real data to be displayed here
    let itemList: McsList = new McsList();

    itemList.push('vApp', new McsListItem('vApp1', 'Virtual Application 1'));
    itemList.push('vApp', new McsListItem('vApp2', 'Virtual Application 2'));
    itemList.push('vApp', new McsListItem('vApp3', 'Virtual Application 3'));
    return itemList;
  }

  public getServerCatalogs(): McsList {
    // TODO: Set the actual obtainment of real data to be displayed here
    let itemList: McsList = new McsList();

    itemList.push('Server Catalog', new McsListItem('serverCatalog1', 'mongo-db-prod 1'));
    itemList.push('Server Catalog', new McsListItem('serverCatalog2', 'mongo-db-prod 2'));
    itemList.push('Server Catalog', new McsListItem('serverCatalog3', 'mongo-db-prod 3'));
    return itemList;
  }

  public getStorageProfiles() {
    // TODO: Set the actual obtainment of real data to be displayed here
    let itemList: McsList = new McsList();

    itemList.push('Storage Profiles', new McsListItem('storageProfiles1', 'Storage Profiles 1'));
    itemList.push('Storage Profiles', new McsListItem('storageProfiles2', 'Storage Profiles 2'));
    itemList.push('Storage Profiles', new McsListItem('storageProfiles3', 'Storage Profiles 3'));
    return itemList;
  }

  public getPrimaryNetwork() {
    // TODO: Set the actual obtainment of real data to be displayed here
    let itemList: McsList = new McsList();

    itemList.push('primaryNetwork', new McsListItem('primaryNetwork1', 'Primary Network 1'));
    itemList.push('primaryNetwork', new McsListItem('primaryNetwork2', 'Primary Network 2'));
    itemList.push('primaryNetwork', new McsListItem('primaryNetwork3', 'Primary Network 3'));
    return itemList;
  }

  public getIpAddressGroup() {
    // TODO: Set the actual obtainment of real data to be displayed here
    let itemList: McsListItem[] = new Array();

    itemList.push(new McsListItem('dhcp', 'DHCP'));
    itemList.push(new McsListItem('next', 'Next in my static pool'));
    return itemList;
  }
}
