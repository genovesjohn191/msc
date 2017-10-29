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
  McsTextContentProvider,
  CoreValidators,
  CoreDefinition
} from '../../../../core';
import {
  refreshView,
  mergeArrays,
  isNullOrEmpty,
  convertToGb
} from '../../../../utilities';
import { ContextualHelpDirective } from '../../../../shared';
import { CreateSelfManagedServersService } from '../create-self-managed-servers.service';
import {
  ServerManageStorage,
  ServerPerformanceScale,
  ServerIpAddress,
  ServerCreateSelfManaged,
  ServerResource,
  ServerNetwork,
  ServerGroupedOs,
  ServerCreateType,
  ServerImageType,
  ServerImage,
  ServerCatalogType
} from '../../models';

const RAM_MINIMUM_VALUE = 2048;
const CPU_MINIMUM_VALUE = 1;
const NEW_SERVER_STORAGE_SLIDER_STEP = 10;
const NEW_SERVER_WIN_STORAGE_SLIDER_MINIMUM_MB = 30 * CoreDefinition.GB_TO_MB_MULTIPLIER;
const VAPP_PLACEHOLDER = 'Select VApp';
const SERVER_IMAGE_PLACEHOLDER = 'Select Image';
const NETWORK_PLACEHOLDER = 'Select Network';

@Component({
  selector: 'mcs-new-self-managed-server',
  templateUrl: './new-self-managed-server.component.html',
  styleUrls: ['./new-self-managed-server.component.scss']
})

export class NewSelfManagedServerComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  public visible: boolean;

  @Input()
  public resource: ServerResource;

  @Input()
  public serversOs: ServerGroupedOs[];

  @Output()
  public onOutputServerDetails: EventEmitter<ServerCreateSelfManaged>;

  @ViewChildren(ContextualHelpDirective)
  public contextualHelpDirectives: QueryList<ContextualHelpDirective>;

  // Form variables
  public formGroupNewServer: FormGroup;
  public formControlVApp: FormControl;
  public formControlImage: FormControl;
  public formControlNetwork: FormControl;
  public formControlScale: FormControl;
  public formControlStorage: FormControl;
  public formControlIpAddress: FormControl;
  public formGroupSubscription: any;

  // Scale and Storage
  public memoryMB: number;
  public cpuCount: number;
  public storageMemoryMB: number;
  public selectedNetwork: ServerNetwork;
  public storageSliderValues: number[];
  public storageAvailableMemoryMB: number;
  public selectedStorage: ServerManageStorage;

  public serverImageData: ServerImage[];

  // Dropdowns
  public vAppItems: any;
  public serverOsItems: any;
  public serverTemplateItems: any;
  public networkItems: any;
  public storageItems: any;

  // Others
  public contextualTextContent: any;
  public availableMemoryMB: number;
  public availableCpuCount: number;
  public animateTrigger: string;

  public get vAppPlaceholder(): string {
    return VAPP_PLACEHOLDER;
  }

  public get serverImagePlaceholder(): string {
    return SERVER_IMAGE_PLACEHOLDER;
  }

  public get networkPlaceholder(): string {
    return NETWORK_PLACEHOLDER;
  }

  private get _memoryGB(): number {
    return Math.floor(convertToGb(this.storageMemoryMB));
  }

  private get _maximumMemoryGB(): number {
    return Math.floor(convertToGb(this.storageAvailableMemoryMB));
  }

  public constructor(
    private _serverService: CreateSelfManagedServersService,
    private _textContentProvider: McsTextContentProvider
  ) {
    this.animateTrigger = 'fadeIn';
    this.memoryMB = 0;
    this.cpuCount = 0;
    this.storageMemoryMB = 0;
    this.availableMemoryMB = 0;
    this.availableCpuCount = 0;
    this.storageSliderValues = new Array<number>();
    this.storageAvailableMemoryMB = 0;
    this.selectedStorage = new ServerManageStorage();
    this.serverImageData = new Array<ServerImage>();
    this.vAppItems = new Array();
    this.serverOsItems = new Array();
    this.serverTemplateItems = new Array();
    this.networkItems = new Array();
    this.storageItems = new Array();
    this.selectedNetwork = new ServerNetwork();
    this.onOutputServerDetails = new EventEmitter<ServerCreateSelfManaged>();
  }

  public ngOnInit() {
    this.contextualTextContent = this._textContentProvider.content
      .servers.createSelfManagedServer.contextualHelp;

    this.memoryMB = RAM_MINIMUM_VALUE;
    this.cpuCount = CPU_MINIMUM_VALUE;
    this.storageMemoryMB = NEW_SERVER_WIN_STORAGE_SLIDER_MINIMUM_MB;

    this._registerFormGroup();

    if (!isNullOrEmpty(this.resource)) {
      this._setVAppItems();
      this._setServerImageItems();
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
        this._serverService.subContextualHelp =
          mergeArrays(this._serverService.subContextualHelp, contextInformations);
      }

      // Select network initial value
      if (!isNullOrEmpty(this.networkItems)) {
        this.formControlNetwork.setValue(this.networkItems[0].value);
      }
    });
  }

  public ngOnDestroy() {
    if (this.formGroupSubscription) {
      this.formGroupSubscription.unsubscribe();
    }
  }

  public onStorageChanged(serverStorage: ServerManageStorage) {
    if (isNullOrEmpty(this.formControlStorage) || isNullOrEmpty(this.resource)) { return; }

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
    if (isNullOrEmpty(this.formControlScale)) { return; }
    if (serverScale.valid) {
      this.formControlScale.setValue(serverScale);
    } else {
      this.formControlScale.reset();
    }
  }

  public onIpAddressChanged(ipAddress: ServerIpAddress): void {
    if (isNullOrEmpty(this.formControlIpAddress)) { return; }
    if (ipAddress.valid) {
      this.formControlIpAddress.setValue(ipAddress);
    } else {
      this.formControlIpAddress.reset();
    }
  }

  private _setAvailableMemoryMB(): void {
    this.availableMemoryMB = this._serverService.computeAvailableMemoryMB(this.resource);
  }

  private _setAvailableCpuCount(): void {
    this.availableCpuCount = this._serverService.computeAvailableCpu(this.resource);
  }

  private _setVAppItems(): void {
    if (isNullOrEmpty(this.resource)) { return; }

    // Populate dropdown list
    this.resource.vApps.forEach((vApp) => {
      this.vAppItems.push({value: vApp.name, text: vApp.name});
    });

  }

  private _setServerImageItems(): void {
    let serverImageId = 1;

    this.serversOs.forEach((groupedOs) => {
      groupedOs.os.forEach((os) => {
        let serverImage = new ServerImage();
        serverImage.id = serverImageId;
        serverImage.imageType = ServerImageType.Os;
        serverImage.image = os.name;

        this.serverImageData.push(serverImage);

        let osItem = { value: serverImage.id, text: serverImage.image };
        let osGroupIndex = this.serverOsItems.findIndex((item) => {
          return item.group === groupedOs.platform;
        });

        if (osGroupIndex > -1) {
          this.serverOsItems[osGroupIndex].items.push(osItem);
        } else {
          this.serverOsItems.push({ group: groupedOs.platform, items: [osItem] });
        }

        serverImageId++;
      });
    });

    this.resource.catalogs.forEach((catalog) => {
      if (catalog.type === ServerCatalogType.SelfManaged) {
        let serverImage = new ServerImage();
        serverImage.id = serverImageId;
        serverImage.imageType = ServerImageType.Template;
        serverImage.image = catalog.itemName;

        this.serverImageData.push(serverImage);
        this.serverTemplateItems.push({ value: serverImage.id, text: serverImage.image });

        serverImageId++;
      }
    });
  }

  private _setNetworkItems(): void {
    if (isNullOrEmpty(this.resource)) { return; }

    // Populate dropdown list
    this.resource.networks.forEach((network) => {
      this.networkItems.push({ value: network.name, text: network.name });
    });
  }

  private _setStorageItems(): void {
    if (isNullOrEmpty(this.resource)) { return; }

    // Populate select with storage profiles
    this.resource.storage.forEach((storage) => {
      this.storageItems.push({ value: storage.name, text: storage.name });
    });
  }

  private _setStorageAvailableMemoryMB(): void {
    let serverStorage = this.formControlStorage.value as ServerManageStorage;

    let resourceStorage = this.resource.storage
      .find((resource) => {
        return resource.name === serverStorage.storageProfile;
      });

    this.storageAvailableMemoryMB = this._serverService.computeAvailableStorageMB(resourceStorage);
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

  private _registerFormGroup(): void {
    // Register Form Controls
    this.formControlVApp = new FormControl('', []);

    this.formControlImage = new FormControl('', [
      CoreValidators.required
    ]);

    this.formControlNetwork = new FormControl('', [
      CoreValidators.required
    ]);

    this.formControlNetwork.valueChanges
      .subscribe((networkSelected) => {
        let networkFound = this.resource.networks.find((network) => {
          return network.name === networkSelected;
        });
        if (networkFound) {
          this.selectedNetwork = networkFound;
        }
      });

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
      formControlVApp: this.formControlVApp,
      formControlImage: this.formControlImage,
      formControlNetwork: this.formControlNetwork,
      formControlScale: this.formControlScale,
      formControlStorage: this.formControlStorage,
      formControlIpAddress: this.formControlIpAddress
    });
    this.formGroupSubscription = this.formGroupNewServer.statusChanges
      .subscribe(() => {
        this._outputServerDetails();
      });
  }

  private _outputServerDetails(): void {
    let newSelfManaged: ServerCreateSelfManaged;
    newSelfManaged = new ServerCreateSelfManaged();

    // Set the variable based on the form values
    newSelfManaged.type = ServerCreateType.New;
    newSelfManaged.vApp = this.formControlVApp.value;

    let serverImage = this.serverImageData.find((data) => {
      return data.id === this.formControlImage.value;
    });

    if (!isNullOrEmpty(serverImage)) {
      newSelfManaged.imageType = serverImage.imageType;
      newSelfManaged.image = serverImage.image;
    }

    newSelfManaged.networkName = this.formControlNetwork.value;
    newSelfManaged.performanceScale = this.formControlScale.value;
    newSelfManaged.serverManageStorage = this.formControlStorage.value;
    newSelfManaged.ipAddress = this.formControlIpAddress.value;
    newSelfManaged.isValid = this.formGroupNewServer.valid;

    this.onOutputServerDetails.next(newSelfManaged);
  }
}
