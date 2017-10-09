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
  ServerManageStorage,
  ServerPerformanceScale,
  ServerIpAddress,
  ServerCreateSelfManaged,
  ServerResource,
  ServerOs,
  ServerNetwork,
  Server
} from '../../models';
import {
  refreshView,
  mergeArrays,
  isNullOrEmpty
} from '../../../../utilities';
import { ContextualHelpDirective } from '../../../../shared';
import { CreateSelfManagedServersService } from '../create-self-managed-servers.service';

@Component({
  selector: 'mcs-copy-self-managed-server',
  templateUrl: './copy-self-managed-server.component.html',
  styleUrls: ['./copy-self-managed-server.component.scss']
})

export class CopySelfManagedServerComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  public visible: boolean;

  @Input()
  public servers: Server[];

  @Input()
  public resource: ServerResource;

  @Input()
  public serversOs: ServerOs[];

  @Output()
  public onOutputServerDetails: EventEmitter<ServerCreateSelfManaged>;

  @ViewChildren(ContextualHelpDirective)
  public contextualHelpDirectives: QueryList<ContextualHelpDirective>;

  // Form variables
  public formGroupCopyServer: FormGroup;
  public formControlTargetServerName: FormControl;
  public formControlVApp: FormControl;
  public formControlVTemplate: FormControl;
  public formControlNetwork: FormControl;
  public formControlScale: FormControl;
  public formControlStorage: FormControl;
  public formControlIpAddress: FormControl;
  public formGroupSubscription: any;

  // Scale and Storage
  public storageMemoryMB: number;
  public selectedNetwork: ServerNetwork;
  public selectedServer: Server;

  // Dropdowns
  public serverItems: McsList;
  public vAppItems: McsList;
  public vTemplateItems: McsList;
  public networkItems: McsList;
  public storageItems: McsList;

  // Others
  public contextualTextContent: any;
  public availableMemoryMB: number;
  public availableCpuCount: number;

  public get memoryMB(): number {
    return this.selectedServer ? this.selectedServer.memoryMB : 0;
  }

  public get cpuCount(): number {
    return this.selectedServer ? this.selectedServer.cpuCount : 0;
  }

  public get storageAvailableMemoryMB(): number {
    let availableMemoryMB: number = 0;
    let serverStorage = this.formControlStorage.value as ServerManageStorage;
    if (!this.resource) { return 0; }

    if (serverStorage) {
      let storageProfile = this.resource.storage
        .find((profile) => {
          return profile.name === serverStorage.storageProfile;
        });

      if (storageProfile) {
        availableMemoryMB = (storageProfile.limitMB - storageProfile.usedMB) -
          serverStorage.storageMB;
      }
    }

    return availableMemoryMB;
  }

  public constructor(
    private _managedServerService: CreateSelfManagedServersService,
    private _textContentProvider: McsTextContentProvider
  ) {
    this.storageMemoryMB = 0;
    this.availableMemoryMB = 0;
    this.availableCpuCount = 0;

    this.serverItems = new McsList();
    this.vAppItems = new McsList();
    this.vTemplateItems = new McsList();
    this.networkItems = new McsList();
    this.storageItems = new McsList();
    this.selectedNetwork = new ServerNetwork();
    this.selectedServer = new Server();
    this.onOutputServerDetails = new EventEmitter<ServerCreateSelfManaged>();
  }

  public ngOnInit() {
    this.contextualTextContent = this._textContentProvider.content
      .servers.createSelfManagedServer.contextualHelp;

    this._registerFormGroup();

    if (this.resource) {
      this._setServersItems();
      this._setVAppItems();
      this._setVTemplateItems();
      this._setStorageItems();
      this._setNetworkItems();
      this._setAvailableMemoryMB();
      this._setAvailableCpuCount();
    }
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

  private _setAvailableMemoryMB(): void {
    this.availableMemoryMB = this.resource.memoryLimitMB - this.resource.memoryUsedMB;
  }

  private _setAvailableCpuCount(): void {
    this.availableCpuCount = this.resource.cpuLimit - this.resource.cpuUsed;
  }

  private _setServersItems(): void {
    if (!this.servers) { return; }

    // Populate dropdown list
    this.servers.forEach((server) => {
      this.serverItems.push('Servers',
        new McsListItem(server.id, server.managementName));
    });

    // Select first element of the dropdown
    if (!isNullOrEmpty(this.serverItems.getGroupNames())) {
      this.formControlTargetServerName.setValue(this.servers[0].id);
      this.selectedServer = this.servers[0];
    }
  }

  private _setVAppItems(): void {
    if (!this.resource) { return; }

    // Populate dropdown list
    this.resource.storage.forEach((storage) => {
      this.vAppItems.push('Virtual Applications', new McsListItem(storage.name, storage.name));
    });
    // Select first element of the dropdown
    if (!isNullOrEmpty(this.vAppItems.getGroupNames())) {
      this.formControlVApp.setValue(this.selectedServer.vAppName);
    }
  }

  private _setVTemplateItems(): void {
    if (!this.serversOs) { return; }

    // Populate dropdown list
    this.serversOs.forEach((serverOs) => {
      this.vTemplateItems.push('Virtual Templates',
        new McsListItem(serverOs.name, serverOs.name));
    });
    // Select first element of the dropdown
    if (!isNullOrEmpty(this.vTemplateItems.getGroupNames())) {
      this.formControlVTemplate.setValue(this.selectedServer.os);
    }
  }

  private _setNetworkItems(): void {
    if (!this.resource) { return; }

    // Populate dropdown list
    this.resource.networks.forEach((network) => {
      this.networkItems.push('Networks', new McsListItem(network.name, network.name));
    });
    // Select first element of the dropdown
    if (!isNullOrEmpty(this.networkItems.getGroupNames())) {
      this.formControlNetwork.setValue(this.selectedServer.hostName);
    }
  }

  private _setStorageItems(): void {
    if (!this.resource) { return; }

    // Populate dropdown list
    this.resource.storage.forEach((storage) => {
      this.storageItems.push('Storages', new McsListItem(storage.name, storage.name));
    });
    // The selection of element is happened under onStorageChanged method
  }

  private _registerFormGroup(): void {
    // Register Form Controls
    this.formControlTargetServerName = new FormControl('', [
      CoreValidators.required
    ]);
    this.formControlTargetServerName.valueChanges
      .subscribe((targetServerId) => {
        let serverFound = this.servers.find((server) => {
          return server.id === targetServerId;
        });
        if (serverFound) {
          this.selectedServer = serverFound;
        }
      });

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
    this.formGroupCopyServer = new FormGroup({
      formControlTargetServerName: this.formControlTargetServerName,
      // formControlVApp: this.formControlVApp,
      formControlVTemplate: this.formControlVTemplate,
      formControlNetwork: this.formControlNetwork,
      formControlScale: this.formControlScale,
      formControlStorage: this.formControlStorage,
      formControlIpAddress: this.formControlIpAddress
    });
    this.formGroupSubscription = this.formGroupCopyServer.statusChanges
      .subscribe(() => {
        this._outputServerDetails();
      });
  }

  private _outputServerDetails(): void {
    let copySelfManaged: ServerCreateSelfManaged;
    copySelfManaged = new ServerCreateSelfManaged();

    // Set the variable based on the form values
    copySelfManaged.targetServerName = this.formControlTargetServerName.value;
    copySelfManaged.vApp = this.formControlVApp.value;
    copySelfManaged.vTemplate = this.formControlVTemplate.value;
    copySelfManaged.networkName = this.formControlNetwork.value;
    copySelfManaged.performanceScale = this.formControlScale.value;
    copySelfManaged.serverManageStorage = this.formControlStorage.value;
    copySelfManaged.ipAddress = this.formControlIpAddress.value;
    copySelfManaged.isValid = this.formGroupCopyServer.valid;

    this.onOutputServerDetails.next(copySelfManaged);
  }
}
