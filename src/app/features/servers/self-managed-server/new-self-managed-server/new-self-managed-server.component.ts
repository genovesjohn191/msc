import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
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
  CoreValidators,
  CoreDefinition
} from '../../../../core';
import {
  refreshView,
  mergeArrays,
  isNullOrEmpty,
  convertToGb,
  isFormControlValid,
  replacePlaceholder,
  appendUnitSuffix
} from '../../../../utilities';
import {
  ContextualHelpDirective,
  FormGroupDirective
} from '../../../../shared';
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
  ServerCatalogItemType
} from '../../models';

const RAM_MINIMUM_VALUE = 2048;
const CPU_MINIMUM_VALUE = 1;
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

export class NewSelfManagedServerComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  public resource: ServerResource;

  @Input()
  public serversOs: ServerGroupedOs[];

  @Output()
  public onOutputServerDetails: EventEmitter<ServerCreateSelfManaged>;

  @ViewChild(FormGroupDirective)
  public fgCreateDirective: FormGroupDirective;

  @ViewChildren(ContextualHelpDirective)
  public contextualHelpDirectives: QueryList<ContextualHelpDirective>;

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
  public serverImageData: ServerImage[];

  // Dropdowns
  public vAppItems: any;
  public serverOsItems: any;
  public serverTemplateItems: any;
  public networkItems: any;
  public storageItems: any;

  // Others
  public createType: ServerCreateType;
  public textContent: any;
  public textHelpContent: any;
  public availableMemoryMB: number;
  public availableCpuCount: number;

  private get _memoryGB(): number {
    return Math.floor(convertToGb(this.storageMemoryMB));
  }

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
      appendUnitSuffix(this._maximumMemoryGB, 'gigabyte')
    );
  }

  public constructor(
    private _serverService: CreateSelfManagedServersService,
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
    this.textContent = this._textContentProvider.content
      .servers.createSelfManagedServer;
    this.textHelpContent = this._textContentProvider.content
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
    this._changeDetectorRef.markForCheck();
  }

  public ngAfterViewInit() {
    refreshView(() => {
      // Merge the sub contextual help
      if (this.contextualHelpDirectives) {
        let contextInformations: ContextualHelpDirective[];
        contextInformations = this.contextualHelpDirectives.map((description) => description);
        this._serverService.subContextualHelp =
          mergeArrays(this._serverService.subContextualHelp, contextInformations);
      }
    });
  }

  public ngOnDestroy() {
    if (this.fgSubscription) {
      this.fgSubscription.unsubscribe();
    }
  }

  public isControlValid(control: any): boolean {
    return isFormControlValid(control);
  }

  public onStorageChanged(serverStorage: ServerManageStorage) {
    if (isNullOrEmpty(this.fcStorage) || isNullOrEmpty(this.resource)) { return; }

    this.fcStorage.setValue(serverStorage);
    if (!isNullOrEmpty(serverStorage.storageProfile) &&
      this.selectedStorage.storageProfile !== serverStorage.storageProfile) {
      this.selectedStorage = serverStorage;
      this._setStorageAvailableMemoryMB();
    }
  }

  public onScaleChanged(serverScale: ServerPerformanceScale) {
    if (isNullOrEmpty(this.fcScale)) { return; }
    if (serverScale.valid) {
      this.fcScale.setValue(serverScale);
    } else {
      this.fcScale.reset();
    }
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
    this.availableMemoryMB = this._serverService.computeAvailableMemoryMB(this.resource);
  }

  private _setAvailableCpuCount(): void {
    this.availableCpuCount = this._serverService.computeAvailableCpu(this.resource);
  }

  private _setVAppItems(): void {
    if (isNullOrEmpty(this.resource)) { return; }

    // Populate dropdown list
    this.resource.vApps.forEach((vApp) => {
      this.vAppItems.push({ value: vApp.name, text: vApp.name });
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

    this.resource.catalogItems.forEach((catalog) => {
      if (catalog.itemType === ServerCatalogItemType.Template) {
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
    let serverStorage = this.fcStorage.value as ServerManageStorage;

    let resourceStorage = this.resource.storage
      .find((resource) => {
        return resource.name === serverStorage.storageProfile;
      });

    if (!isNullOrEmpty(resourceStorage)) {
      this.storageAvailableMemoryMB = resourceStorage.limitMB;
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

    let serverImage = this.serverImageData.find((data) => {
      return data.id === this.fcImage.value;
    });

    if (!isNullOrEmpty(serverImage)) {
      newSelfManaged.imageType = serverImage.imageType;
      newSelfManaged.image = serverImage.image;
    }

    newSelfManaged.serverName = this.fcServerName.value;
    newSelfManaged.networkName = this.fcNetwork.value;
    newSelfManaged.performanceScale = this.fcScale.value;
    newSelfManaged.serverManageStorage = this.fcStorage.value;
    newSelfManaged.ipAddress = this.fcIpAddress.value;
    newSelfManaged.isValid = this.fgCreateDirective.isValid();

    this.onOutputServerDetails.next(newSelfManaged);
  }

  private _customServerNameValidator(inputValue: any): boolean {
    return CoreDefinition.REGEX_SERVER_NAME_PATTERN.test(inputValue);
  }
}
