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
import { BaseSelfManagedServer } from '../base-self-managed-server';

@Component({
  selector: 'mcs-new-self-managed-server',
  templateUrl: './new-self-managed-server.component.html',
  styles: [require('./new-self-managed-server.component.scss')]
})

export class NewSelfManagedServerComponent implements OnInit, AfterViewInit {
  public computeValue: any;
  public storageValue: any;
  public virtualApplicationValue: any;
  public virtualApplicationItems: McsList;

  public virtualTemplateValue: any;
  public virtualTemplateItems: McsList;

  public primaryNetworkValue: any;
  public primaryNetworkItems: McsList;

  public storageProfileValue: any;
  public storageProfileItems: McsList;

  public ipAddressValue: string;
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
    this.ipAddressValue = 'dhcp';

    this.virtualApplicationItems = this.getVirtualApplications();
    this.virtualTemplateItems = this.getVirtualTemplates();
    this.primaryNetworkItems = this.getPrimaryNetwork();
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

  public getVirtualApplications(): McsList {
    // TODO: Set the actual obtainment of real data to be displayed here
    let itemList: McsList = new McsList();

    itemList.push('vApp', new McsListItem('vApp1', 'Virtual Application 1'));
    itemList.push('vApp', new McsListItem('vApp2', 'Virtual Application 2'));
    itemList.push('vApp', new McsListItem('vApp3', 'Virtual Application 3'));
    return itemList;
  }

  public getVirtualTemplates(): McsList {
    // TODO: Set the actual obtainment of real data to be displayed here
    let itemList: McsList = new McsList();

    itemList.push('vTemplate', new McsListItem('vTemplate1', 'Virtual Template 1'));
    itemList.push('vTemplate', new McsListItem('vTemplate2', 'Virtual Template 2'));
    itemList.push('vTemplate', new McsListItem('vTemplate3', 'Virtual Template 3'));
    return itemList;
  }

  public getStorageProfiles() {
    // TODO: Set the actual obtainment of real data to be displayed here
    let itemList: McsList = new McsList();

    itemList.push('storageProfile', new McsListItem('storageProfile1', 'Storage 1'));
    itemList.push('storageProfile', new McsListItem('storageProfile2', 'Storage 2'));
    itemList.push('storageProfile', new McsListItem('storageProfile3', 'Storage 3'));
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
