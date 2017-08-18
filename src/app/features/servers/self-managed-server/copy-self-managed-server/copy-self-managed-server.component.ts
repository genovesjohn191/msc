import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  ViewChildren,
  QueryList
} from '@angular/core';
import {
  FormGroup,
  FormControl
} from '@angular/forms';
import {
  McsList,
  McsListItem,
  McsTextContentProvider,
  CoreValidators
} from '../../../../core';
import {
  ServerManageStorage,
  ServerPerformanceScale,
  ServerIpAddress,
  ServerCreateSelfManaged,
  ServerResource,
  ServerTemplate
} from '../../models';
import {
  refreshView,
  mergeArrays
} from '../../../../utilities';
import { CreateSelfManagedServersService } from '../create-self-managed-servers.service';
import { ContextualHelpDirective } from '../../shared/contextual-help/contextual-help.directive';

@Component({
  selector: 'mcs-copy-self-managed-server',
  templateUrl: './copy-self-managed-server.component.html',
  styles: [require('./copy-self-managed-server.component.scss')]
})

export class CopySelfManagedServerComponent implements OnInit, AfterViewInit {
  @Input()
  public resource: ServerResource;

  @Input()
  public template: ServerTemplate;

  @Output()
  public onOutputServerDetails: EventEmitter<ServerCreateSelfManaged>;

  @ViewChildren(ContextualHelpDirective)
  public contextualHelpDirectives: QueryList<ContextualHelpDirective>;

  // Form variables
  public formGroupCopyServer: FormGroup;
  public formControlTargetServerName: FormControl;
  public formControlVApp: FormControl;
  public formControlCatalog: FormControl;
  public formControlNetwork: FormControl;
  public formControlScale: FormControl;
  public formControlStorage: FormControl;
  public formControlIpAddress: FormControl;

  // Scale and Storage
  public memoryMB: number;
  public cpuCount: number;
  public storageMemoryMB: number;
  public storageAvailableMemoryMB: number;

  // Dropdowns
  public ipAddressValue: string;
  public primaryNetworkItems: McsList;
  public serverNameItems: McsList;
  public virtualApplicationItems: McsList;
  public serverCatalogItems: McsList;
  public storageProfileList: McsList;
  public contextualTextContent: any;

  public constructor(
    private _managedServerService: CreateSelfManagedServersService,
    private _textContentProvider: McsTextContentProvider
  ) {
    // TODO: Temporary set the value for demo purpose
    this.memoryMB = 4096;
    this.cpuCount = 2;
    this.storageMemoryMB = 204800;
    this.storageAvailableMemoryMB = 921600;

    this.onOutputServerDetails = new EventEmitter<ServerCreateSelfManaged>();
  }

  public ngOnInit() {
    this.contextualTextContent = this._textContentProvider.content
      .servers.createSelfManagedServer.contextualHelp;
    this.ipAddressValue = 'next';

    this._registerFormGroup();

    this.primaryNetworkItems = this.getPrimaryNetwork();
    this.serverNameItems = this.getServerNames();
    this.virtualApplicationItems = this.getVirtualApplications();
    this.serverCatalogItems = this.getServerCatalogs();
    this.storageProfileList = this.getStorageProfiles();
  }

  public ngAfterViewInit() {
    refreshView(() => {
      if (this.contextualHelpDirectives) {
        let contextInformations: ContextualHelpDirective[];
        contextInformations = this.contextualHelpDirectives
          .map((description) => {
            return description;
          });
        this._managedServerService.subContextualHelp =
          mergeArrays(this._managedServerService.subContextualHelp, contextInformations);
      }
    });
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

  public onStorageChanged(serverStorage: ServerManageStorage) {
    if (!this.formControlStorage) { return; }
    if (serverStorage.valid) {
      this.formControlStorage.setValue(serverStorage);
    } else {
      this.formControlStorage.reset();
    }
  }

  public onScaleChanged(serverScale: ServerPerformanceScale) {
    if (!this.formControlScale) { return; }
    if (serverScale.valid) {
      this.formControlScale.setValue(serverScale);
    } else {
      this.formControlScale.reset();
    }
  }

  public onIpAddressChanged(ipAddress: ServerIpAddress): void {
    if (!this.formControlIpAddress) { return; }
    if (ipAddress.valid) {
      this.formControlIpAddress.setValue(ipAddress);
    } else {
      this.formControlIpAddress.reset();
    }
  }

  private _registerFormGroup(): void {
    // Register Form Controls
    this.formControlTargetServerName = new FormControl('', [
      CoreValidators.required
    ]);

    this.formControlVApp = new FormControl('', [
      CoreValidators.required
    ]);

    this.formControlCatalog = new FormControl('', [
      CoreValidators.required
    ]);

    this.formControlNetwork = new FormControl('', [
      CoreValidators.required
    ]);

    this.formControlScale = new FormControl('', [
      CoreValidators.required
    ]);

    this.formControlStorage = new FormControl('', [
      CoreValidators.required
    ]);

    this.formControlIpAddress = new FormControl('', [
      CoreValidators.required
    ]);

    // Register Form Groups using binding
    this.formGroupCopyServer = new FormGroup({
      formControlTargetServerName: this.formControlTargetServerName,
      formControlVApp: this.formControlVApp,
      formControlCatalog: this.formControlCatalog,
      formControlNetwork: this.formControlNetwork,
      formControlIpAddress: this.formControlIpAddress
    });
    this.formGroupCopyServer.statusChanges.subscribe((status) => {
      this._outputServerDetails();
    });
  }

  private _outputServerDetails(): void {
    let copySelfManaged: ServerCreateSelfManaged;
    copySelfManaged = new ServerCreateSelfManaged();

    // Set the variable based on the form values
    copySelfManaged.targetServerName = this.formControlTargetServerName.value;
    copySelfManaged.vApp = this.formControlVApp.value;
    copySelfManaged.networkName = this.formControlNetwork.value;
    copySelfManaged.catalog = this.formControlCatalog.value;
    copySelfManaged.performanceScale = this.formControlScale.value;
    copySelfManaged.serverManageStorage = this.formControlStorage.value;
    copySelfManaged.ipAddress = this.formControlIpAddress.value;
    copySelfManaged.isValid = this.formGroupCopyServer.valid;
    this.onOutputServerDetails.next(copySelfManaged);
  }
}
