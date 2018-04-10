import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import {
  FormGroup,
  FormControl
} from '@angular/forms';
import {
  McsTextContentProvider,
  CoreValidators
} from '../../../../../core';
import {
  ServerManageStorage,
  ServerPerformanceScale,
  ServerIpAddress,
  ServerCreateSelfManaged,
  ServerResource,
  ServerGroupedOs,
  ServerNetwork,
  Server,
  ServerCreateType
} from '../../../models';
import {
  isNullOrEmpty,
  convertToGb,
  unsubscribeSafely
} from '../../../../../utilities';
import { ServersService } from '../../../servers.service';

const NEW_SERVER_STORAGE_SLIDER_STEP = 10;

@Component({
  selector: 'mcs-copy-self-managed-server',
  templateUrl: './copy-self-managed-server.component.html'
})

export class CopySelfManagedServerComponent implements OnInit, OnDestroy {
  @Input()
  public visible: boolean;

  @Input()
  public servers: Server[];

  @Input()
  public resource: ServerResource;

  @Input()
  public serversOs: ServerGroupedOs[];

  @Output()
  public onOutputServerDetails: EventEmitter<ServerCreateSelfManaged>;

  // Form variables
  public formGroupCopyServer: FormGroup;
  public formControlTargetServer: FormControl;
  public formControlVApp: FormControl;
  public formControlImage: FormControl;
  public formControlNetwork: FormControl;
  public formControlScale: FormControl;
  public formControlStorage: FormControl;
  public formControlIpAddress: FormControl;
  public formGroupSubscription: any;

  // Scale and Storage
  public selectedServer: Server;
  public storageMemoryMB: number;
  public storageAvailableMemoryMB: number;
  public selectedNetwork: ServerNetwork;
  public storageSliderValues: number[];
  public selectedStorage: ServerManageStorage;

  // Dropdowns
  public serverItems: any;
  public vAppItems: any;
  public networkItems: any;
  public storageItems: any;

  // Others
  public createType: ServerCreateType;
  public contextualTextContent: any;
  public availableMemoryMB: number;
  public availableCpuCount: number;

  public get memoryMB(): number {
    return this.selectedServer.compute ? this.selectedServer.compute.memoryMB : 0;
  }

  public get cpuCount(): number {
    return this.selectedServer.compute ? this.selectedServer.compute.cpuCount : 0;
  }

  private get _memoryGB(): number {
    return Math.floor(convertToGb(this.storageMemoryMB));
  }

  private get _maximumMemoryGB(): number {
    return this._memoryGB + Math.floor(convertToGb(this.storageAvailableMemoryMB));
  }

  public constructor(
    private _serversService: ServersService,
    private _textContentProvider: McsTextContentProvider
  ) {
    this.storageMemoryMB = 0;
    this.storageAvailableMemoryMB = 0;
    this.storageSliderValues = new Array<number>();
    this.selectedStorage = new ServerManageStorage();
    this.availableMemoryMB = 0;
    this.availableCpuCount = 0;

    this.createType = ServerCreateType.Copy;
    this.serverItems = new Array();
    this.vAppItems = new Array();
    this.networkItems = new Array();
    this.storageItems = new Array();
    this.selectedNetwork = new ServerNetwork();
    this.selectedServer = new Server();
    this.onOutputServerDetails = new EventEmitter<ServerCreateSelfManaged>();
  }

  public ngOnInit() {
    this.contextualTextContent = this._textContentProvider.content
      .servers.createServer.selfManagedServer.contextualHelp;

    this._registerFormGroup();

    if (this.resource) {
      this._setServersItems();
      this._setVAppItems();
      this._setStorageItems();
      this._setNetworkItems();
      this._setAvailableMemoryMB();
      this._setAvailableCpuCount();
    }
  }

  public ngOnDestroy() {
    unsubscribeSafely(this.formGroupSubscription);
  }

  public onStorageChanged(serverStorage: ServerManageStorage) {
    if (isNullOrEmpty(this.formControlStorage)) { return; }

    if (serverStorage.valid) {
      this.formControlStorage.setValue(serverStorage);
      if (this.selectedStorage.storageProfile !== serverStorage.storageProfile) {
        this.selectedStorage = serverStorage;
        this._setStorageAvailableMemoryMB();
        this._setStorageSliderValues();
      }
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
    this.availableMemoryMB = this._serversService.computeAvailableMemoryMB(this.resource);
  }

  private _setAvailableCpuCount(): void {
    this.availableCpuCount = this._serversService.computeAvailableCpu(this.resource);
  }

  private _setServersItems(): void {
    if (!this.servers) { return; }

    // Populate dropdown list
    this.servers.forEach((server) => {
      this.serverItems.push({
        'value': server.id,
        'text': server.name
      });
    });

    // Select first element of the dropdown
    if (!isNullOrEmpty(this.serverItems)) {
      this.formControlTargetServer.setValue(this.servers[0].id);
      this.selectedServer = this.servers[0];
    }
  }

  private _setVAppItems(): void {
    if (!this.resource) { return; }

    // Populate dropdown list
    this.resource.vApps.forEach((vApp) => {
      this.vAppItems.push({
        'value': vApp.name,
        'text': vApp.name
      });
    });

    // Select first element of the dropdown
    if (!isNullOrEmpty(this.vAppItems) && !isNullOrEmpty(this.selectedServer.vApp)) {
      this.formControlVApp.setValue(this.selectedServer.vApp);
    }
  }

  private _setNetworkItems(): void {
    if (!this.resource) { return; }

    // Populate dropdown list
    this.resource.networks.forEach((network) => {
      this.networkItems.push({
        'value': network.name,
        'text': network.name
      });
    });
    // Select first element of the dropdown
    if (!isNullOrEmpty(this.networkItems)) {
      this.formControlNetwork.setValue(this.selectedServer.hostname);
    }
  }

  private _setStorageItems(): void {
    if (!this.resource) { return; }

    // Populate dropdown list
    this.resource.storage.forEach((storage) => {
      this.storageItems.push({ value: storage.name, text: storage.name });
    });

    this._setStorageMemoryMB();
  }

  private _setStorageAvailableMemoryMB(): void {
    let serverStorage = this.formControlStorage.value as ServerManageStorage;

    let resourceStorage = this.resource.storage
      .find((resource) => {
        return resource.name === serverStorage.storageProfile;
      });

    this.storageAvailableMemoryMB = this._serversService
      .computeAvailableStorageMB(resourceStorage, this.formControlTargetServer.value);
  }

  private _setStorageSliderValues(): void {
    if (isNullOrEmpty(this._memoryGB) || isNullOrEmpty(this._maximumMemoryGB)) { return; }

    this.storageSliderValues.splice(0);
    this.storageSliderValues.push(this._memoryGB);
    for (let value = this._memoryGB; value < this._maximumMemoryGB;) {
      if ((value + NEW_SERVER_STORAGE_SLIDER_STEP) <= this._maximumMemoryGB) {
        value += NEW_SERVER_STORAGE_SLIDER_STEP;
      } else {
        value = this._maximumMemoryGB;
      }

      this.storageSliderValues.push(value);
    }
  }

  private _setStorageMemoryMB(): void {
    if (isNullOrEmpty(this.selectedServer.storageDevices)) { return; }

    this.storageMemoryMB = this.selectedServer.storageDevices[0].sizeMB;
  }

  private _registerFormGroup(): void {
    // Register Form Controls
    this.formControlTargetServer = new FormControl('', [
      CoreValidators.required
    ]);
    this.formControlTargetServer.valueChanges
      .subscribe((targetServerId) => {
        let serverFound = this.servers.find((server) => {
          return server.id === targetServerId;
        });
        if (serverFound) {
          this.selectedServer = serverFound;
        }
      });

    this.formControlVApp = new FormControl('', []);

    this.formControlImage = new FormControl('', [
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
      formControlTargetServer: this.formControlTargetServer,
      formControlVApp: this.formControlVApp,
      formControlImage: this.formControlImage,
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
    copySelfManaged.type = ServerCreateType.Copy;
    copySelfManaged.targetServer = this.formControlTargetServer.value;
    copySelfManaged.vApp = this.formControlVApp.value;
    copySelfManaged.image = this.formControlImage.value;
    copySelfManaged.networkName = this.formControlNetwork.value;
    copySelfManaged.performanceScale = this.formControlScale.value;
    copySelfManaged.serverManageStorage = this.formControlStorage.value;
    copySelfManaged.ipAddress = this.formControlIpAddress.value;
    copySelfManaged.isValid = this.formGroupCopyServer.valid;

    this.onOutputServerDetails.next(copySelfManaged);
  }
}
