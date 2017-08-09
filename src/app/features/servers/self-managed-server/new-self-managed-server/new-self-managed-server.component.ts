import {
  Component,
  OnInit,
  OnDestroy,
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
  refreshView,
  mergeArrays
} from '../../../../utilities';
import { CreateSelfManagedServersService } from '../create-self-managed-servers.service';
import { ContextualHelpDirective } from '../../shared/contextual-help/contextual-help.directive';
import {
  ServerManageStorage,
  ServerPerformanceScale,
  ServerIpAddress,
  ServerCreateSelfManaged
} from '../../models';

@Component({
  selector: 'mcs-new-self-managed-server',
  templateUrl: './new-self-managed-server.component.html',
  styles: [require('./new-self-managed-server.component.scss')]
})

export class NewSelfManagedServerComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  public isVisible: boolean;

  @Output()
  public onOutputServerDetails: EventEmitter<ServerCreateSelfManaged>;

  @ViewChildren(ContextualHelpDirective)
  public contextualHelpDirectives: QueryList<ContextualHelpDirective>;

  // Form variables
  public formGroupNewServer: FormGroup;
  public formControlVApp: FormControl;
  public formControlVTemplate: FormControl;
  public formControlNetwork: FormControl;
  public formControlScale: FormControl;
  public formControlStorage: FormControl;
  public formControlIpAddress: FormControl;
  public formGroupSubscription: any;

  // Scale and Storage
  public memoryInMb: number;
  public cpuCount: number;
  public storageMemoryInGb: number;
  public storageAvailableMemoryInGb: number;

  // Dropdowns
  public virtualApplicationItems: McsList;
  public virtualTemplateItems: McsList;
  public primaryNetworkItems: McsList;
  public storageProfileItems: McsList;
  public ipAddressItems: McsListItem[];
  public contextualTextContent: any;

  public constructor(
    private _managedServerService: CreateSelfManagedServersService,
    private _textContentProvider: McsTextContentProvider
  ) {
    // TODO: Temporary set the value for demo purpose
    this.memoryInMb = 4096;
    this.cpuCount = 2;
    this.storageMemoryInGb = 200;
    this.storageAvailableMemoryInGb = 900;

    this.isVisible = false;
    this.onOutputServerDetails = new EventEmitter<ServerCreateSelfManaged>();
  }

  public ngOnInit() {
    this.contextualTextContent = this._textContentProvider.content
      .servers.createSelfManagedServer.contextualHelp;

    this._registerFormGroup();

    this.virtualApplicationItems = this.getVirtualApplications();
    this.virtualTemplateItems = this.getVirtualTemplates();
    this.primaryNetworkItems = this.getPrimaryNetwork();
    this.storageProfileItems = this.getStorageProfiles();
    this.ipAddressItems = this.getIpAddressGroup();
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

  public ngOnDestroy() {
    if (this.formGroupSubscription) {
      this.formGroupSubscription.unsubscribe();
    }
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

    itemList.push('Storage Profiles', new McsListItem('storageProfile1', 'Storage 1'));
    itemList.push('Storage Profiles', new McsListItem('storageProfile2', 'Storage 2'));
    itemList.push('Storage Profiles', new McsListItem('storageProfile3', 'Storage 3'));
    return itemList;
  }

  public getPrimaryNetwork() {
    // TODO: Set the actual obtainment of real data to be displayed here
    let itemList: McsList = new McsList();

    itemList.push('Primary Network', new McsListItem('primaryNetwork1', 'Primary Network 1'));
    itemList.push('Primary Network', new McsListItem('primaryNetwork2', 'Primary Network 2'));
    itemList.push('Primary Network', new McsListItem('primaryNetwork3', 'Primary Network 3'));
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
    this.formControlVApp = new FormControl('', [
      CoreValidators.required
    ]);

    this.formControlVTemplate = new FormControl('', [
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
    this.formGroupNewServer = new FormGroup({
      formControlVapp: this.formControlVApp,
      formControlVTemplate: this.formControlVTemplate,
      formControlNetwork: this.formControlNetwork,
      formControlScale: this.formControlScale,
      formControlStorage: this.formControlStorage,
      formControlIpAddress: this.formControlIpAddress
    });
    this.formGroupSubscription = this.formGroupNewServer.statusChanges
      .subscribe((status) => {
        this._outputServerDetails();
      });
  }

  private _outputServerDetails(): void {
    let newSelfManaged: ServerCreateSelfManaged;
    newSelfManaged = new ServerCreateSelfManaged();

    // Set the variable based on the form values
    newSelfManaged.vApp = this.formControlVApp.value;
    newSelfManaged.vTemplate = this.formControlVTemplate.value;
    newSelfManaged.network = this.formControlNetwork.value;
    newSelfManaged.performanceScale = this.formControlScale.value;
    newSelfManaged.serverManageStorage = this.formControlStorage.value;
    newSelfManaged.isValid = this.formGroupNewServer.valid;
    this.onOutputServerDetails.next(newSelfManaged);
  }
}
