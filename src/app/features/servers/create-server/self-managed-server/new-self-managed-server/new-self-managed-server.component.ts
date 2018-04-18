import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ViewChildren,
  QueryList,
  ChangeDetectorRef,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormControlDirective
} from '@angular/forms';
import {
  McsTextContentProvider,
  McsOption,
  CoreValidators,
  CoreDefinition,
  McsUnitType
} from '../../../../../core';
import {
  isNullOrEmpty,
  convertToGb,
  isFormControlValid,
  replacePlaceholder,
  appendUnitSuffix,
  unsubscribeSafely
} from '../../../../../utilities';
import { FormGroupDirective } from '../../../../../shared';
import { ServersService } from '../../../servers.service';
import {
  ServerManageStorage,
  ServerPerformanceScale,
  ServerIpAddress,
  ServerCreateSelfManaged,
  ServerResource,
  ServerNetwork,
  ServerOperatingSystem,
  ServerCreateType,
  ServerImage,
  ServerImageType,
  ServerCatalogItem,
  ServerCatalogItemType
} from '../../../models';

const RAM_MINIMUM_VALUE = 2048;
const CPU_MINIMUM_VALUE = 2;
const NEW_SERVER_STORAGE_SLIDER_STEP = 10;
const NEW_SERVER_WIN_STORAGE_SLIDER_MINIMUM_MB = 30 * CoreDefinition.GB_TO_MB_MULTIPLIER;

@Component({
  selector: 'mcs-new-self-managed-server',
  templateUrl: './new-self-managed-server.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  }
})

export class NewSelfManagedServerComponent implements OnInit, OnDestroy {
  @Input()
  public resource: ServerResource;

  @Input()
  public serversOs: ServerOperatingSystem[];

  @Output()
  public onOutputServerDetails: EventEmitter<ServerCreateSelfManaged>;

  @ViewChild(FormGroupDirective)
  public fgCreateDirective: FormGroupDirective;

  @ViewChildren(FormControlDirective)
  public formControls: QueryList<FormControlDirective>;

  // Form variables
  public fgNewServer: FormGroup;
  public fcServerName: FormControl;
  public fcVApp: FormControl;
  public fcImage: FormControl;
  public fcNetwork: FormControl;
  public fcScale: FormControl;
  public fcStorage: FormControl;
  public fcIpAddress: FormControl;
  public fgSubscription: any;

  // Scale and Storage
  public memoryMB: number;
  public cpuCount: number;
  public storageMemoryMB: number;
  public selectedNetwork: ServerNetwork;
  public storageSliderValues: number[];
  public storageAvailableMemoryMB: number;
  public selectedStorage: ServerManageStorage;

  // Dropdowns
  public vAppItems: McsOption[];
  public serverOsItems: any;
  public networkItems: McsOption[];
  public storageItems: McsOption[];
  public operatingSystemsMap: Map<string, ServerImage[]>;
  public customTemplates: ServerImage[];

  // Others
  public createType: ServerCreateType;
  public textContent: any;
  public textHelpContent: any;
  public availableMemoryMB: number;
  public availableCpuCount: number;

  private get _maximumMemoryGB(): number {
    return Math.floor(convertToGb(this.storageAvailableMemoryMB));
  }

  public get sliderStep(): number {
    return NEW_SERVER_STORAGE_SLIDER_STEP;
  }

  public get storageWarning(): string {
    return replacePlaceholder(
      this.textContent.fullStorageSpace,
      'remaining_memory',
      appendUnitSuffix(this._maximumMemoryGB, McsUnitType.Gigabyte)
    );
  }

  public get hasOperatingSystems(): boolean {
    return this.operatingSystemsMap.size > 0;
  }

  public get hasCustomTemplates(): boolean {
    return  this.customTemplates.length > 0;
  }

  public constructor(
    private _serversService: ServersService,
    private _textContentProvider: McsTextContentProvider,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.memoryMB = 0;
    this.cpuCount = 0;
    this.storageMemoryMB = 0;
    this.availableMemoryMB = 0;
    this.availableCpuCount = 0;
    this.storageSliderValues = new Array<number>();
    this.createType = ServerCreateType.New;
    this.storageAvailableMemoryMB = 0;
    this.selectedStorage = new ServerManageStorage();
    this.selectedNetwork = new ServerNetwork();
    this.onOutputServerDetails = new EventEmitter<ServerCreateSelfManaged>();
    this.operatingSystemsMap = new Map<string, ServerImage[]>();
    this.customTemplates = new Array<ServerImage>();
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content
      .servers.createServer.selfManagedServer;
    this.textHelpContent = this.textContent.contextualHelp;

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
    this._changeDetectorRef.markForCheck();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this.fgSubscription);
  }

  public isControlValid(control: any): boolean {
    return isFormControlValid(control);
  }

  public onStorageChanged(serverStorage: ServerManageStorage) {
    if (isNullOrEmpty(this.fcStorage) || isNullOrEmpty(this.resource)) { return; }

    // Set the value of the storage if it is value
    // otherwise, reset the form control to check on predeployment
    serverStorage.valid ? this.fcStorage.setValue(serverStorage) :
      this.fcStorage.reset();

    if (!isNullOrEmpty(serverStorage.storageProfile) &&
      this.selectedStorage.storageProfile !== serverStorage.storageProfile) {
      this.selectedStorage = serverStorage;
      this._setStorageAvailableMemoryMB();
    }
  }

  public onScaleChanged(serverScale: ServerPerformanceScale) {
    if (isNullOrEmpty(this.fcScale)) { return; }

    // Set the value of the scale if it is value
    // otherwise, reset the form control to check on predeployment
    serverScale.valid ? this.fcScale.setValue(serverScale) :
      this.fcScale.reset();
    this._setStorageAvailableMemoryMB();
  }

  public onIpAddressChanged(ipAddress: ServerIpAddress): void {
    if (isNullOrEmpty(this.fcIpAddress)) { return; }
    if (ipAddress.valid) {
      this.fcIpAddress.setValue(ipAddress);
    } else {
      this.fcIpAddress.reset();
    }
  }

  public convertMaxCharText(text: string, maxchar: number): string {
    return replacePlaceholder(text, 'max_char', maxchar.toString());
  }

  private _setAvailableMemoryMB(): void {
    this.availableMemoryMB = this._serversService.computeAvailableMemoryMB(this.resource);
  }

  private _setAvailableCpuCount(): void {
    this.availableCpuCount = this._serversService.computeAvailableCpu(this.resource);
  }

  private _setVAppItems(): void {
    // Check the vAppsData
    let hasVapps: boolean = !isNullOrEmpty(this.resource) && !isNullOrEmpty(this.resource.vApps);
    if (!hasVapps) { return; }

    // Populate dropdown list
    this.vAppItems = new Array();
    this.resource.vApps.forEach((vApp) => {
      this.vAppItems.push({ value: vApp.name, text: vApp.name });
    });
  }

  private _setServerImageItems(): void {
    // Set the server image
    this._filterOsGroup(this.serversOs);

    // Set custom templates
    if (isNullOrEmpty(this.resource)) { return; }
    this._filterCustomTemplates(this.resource.catalogItems);
  }

  private _filterOsGroup(_operatingSystems: ServerOperatingSystem[]): void {
    if (isNullOrEmpty(_operatingSystems)) { return; }

    _operatingSystems.forEach((operatingSystem) => {
      let keyString = operatingSystem.name.split(CoreDefinition.REGEX_SPACE_AND_DASH);
      if (isNullOrEmpty(keyString)) { return; }
      let groupedOs: ServerImage[];

      let existingOs = this.operatingSystemsMap.get(keyString[0]);
      groupedOs = isNullOrEmpty(existingOs) ? new Array() : existingOs;

      let os = new ServerImage();
      os.image = operatingSystem.name;
      os.imageType = ServerImageType.Os;

      groupedOs.push(os);
      this.operatingSystemsMap.set(keyString[0], groupedOs);
    });
  }

  private _filterCustomTemplates(_catalogItems: ServerCatalogItem[]): void {
    if (isNullOrEmpty(_catalogItems)) { return; }

    _catalogItems.forEach((catalog) => {
      if (catalog.itemType === ServerCatalogItemType.Template) {
        let template = new ServerImage();
        template.image = catalog.itemName;
        template.imageType = ServerImageType.Template;
        this.customTemplates.push(template);
      }
    });
  }

  private _setNetworkItems(): void {
    // Check the Networks
    let hasNetworks: boolean = !isNullOrEmpty(this.resource) &&
      !isNullOrEmpty(this.resource.networks);
    if (!hasNetworks) { return; }

    // Populate dropdown list
    this.networkItems = new Array();
    this.resource.networks.forEach((network) => {
      this.networkItems.push({ value: network.name, text: network.name });
    });
  }

  private _setStorageItems(): void {
    // Check the Storage
    let hasStorage: boolean = !isNullOrEmpty(this.resource) &&
      !isNullOrEmpty(this.resource.storage);
    if (!hasStorage) { return; }

    // Populate select with storage profiles
    this.storageItems = new Array();
    this.resource.storage.forEach((storage) => {
      this.storageItems.push({ value: storage.name, text: storage.name });
    });
  }

  /**
   * Set the available storage memory
   *
   * `@Note:` Total available storage - Currently selected RAM
   */
  private _setStorageAvailableMemoryMB(): void {
    if (isNullOrEmpty(this.fcStorage.value)) { return; }

    let serverStorage = this.fcStorage.value as ServerManageStorage;
    let resourceStorage = this.resource.storage
      .find((resource) => {
        return resource.name === serverStorage.storageProfile;
      });

    if (!isNullOrEmpty(resourceStorage)) {
      let currentSelectedScale = this.fcScale.value && this.fcScale.value.memoryMB;
      this.storageAvailableMemoryMB = this._serversService
        .computeAvailableStorageMB(resourceStorage, currentSelectedScale);
    }
  }

  private _registerFormGroup(): void {
    // Register Form Controls
    this.fcServerName = new FormControl('', [
      CoreValidators.required,
      CoreValidators.custom(
        this._customServerNameValidator.bind(this),
        'invalidServerName'
      )
    ]);

    this.fcVApp = new FormControl('', [
      // Optional selection
    ]);

    this.fcImage = new FormControl('', [
      CoreValidators.required
    ]);

    this.fcNetwork = new FormControl('', [
      CoreValidators.required
    ]);

    this.fcNetwork.valueChanges
      .subscribe((networkSelected) => {
        let networkFound = this.resource.networks.find((network) => {
          return network.name === networkSelected;
        });
        if (networkFound) {
          this.selectedNetwork = networkFound;
        }
      });

    this.fcScale = new FormControl('', [
      CoreValidators.required
    ]);

    this.fcStorage = new FormControl('', [
      CoreValidators.required
    ]);

    this.fcIpAddress = new FormControl('', [
      CoreValidators.required
    ]);

    // Register Form Groups using binding
    this.fgNewServer = new FormGroup({
      formControlServerName: this.fcServerName,
      formControlVApp: this.fcVApp,
      formControlImage: this.fcImage,
      formControlNetwork: this.fcNetwork,
      formControlScale: this.fcScale,
      formControlStorage: this.fcStorage,
      formControlIpAddress: this.fcIpAddress
    });
    this.fgSubscription = this.fgNewServer.statusChanges
      .subscribe(() => {
        this._outputServerDetails();
      });
  }

  private _outputServerDetails(): void {
    let newSelfManaged: ServerCreateSelfManaged;
    newSelfManaged = new ServerCreateSelfManaged();

    // Set the variable based on the form values
    newSelfManaged.type = ServerCreateType.New;
    newSelfManaged.vApp = this.fcVApp.value;

    let serverImage = this.fcImage.value as ServerImage;

    if (!isNullOrEmpty(serverImage)) {
      newSelfManaged.imageType = serverImage.imageType;
      newSelfManaged.image = serverImage.image;
    }

    newSelfManaged.serverName = this.fcServerName.value;
    newSelfManaged.networkName = this.fcNetwork.value;
    newSelfManaged.performanceScale = this.fcScale.value;
    newSelfManaged.serverManageStorage = this.fcStorage.value;
    newSelfManaged.ipAddress = this.fcIpAddress.value;
    newSelfManaged.isValid = this.fgCreateDirective.isValid() &&
      this.fcStorage.valid && this.fcScale.valid && this.fcIpAddress.valid;

    this.onOutputServerDetails.next(newSelfManaged);
  }

  private _customServerNameValidator(inputValue: any): boolean {
    return CoreDefinition.REGEX_SERVER_NAME_PATTERN.test(inputValue);
  }
}
