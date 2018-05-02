import {
  Component,
  OnInit,
  OnDestroy,
  Input
} from '@angular/core';
import {
  FormGroup,
  FormControl
} from '@angular/forms';
import {
  Observable,
  Subscription
} from 'rxjs/Rx';
import {
  McsErrorHandlerService,
  McsTextContentProvider,
  CoreDefinition,
  CoreValidators,
  McsUnitType
} from '../../../../core';
import {
  replacePlaceholder,
  isNullOrEmpty,
  appendUnitSuffix,
  convertMbToGb
} from '../../../../utilities';
import {
  ServerCreateType,
  ServerCreateDetails,
  ServerResource,
  ServerOperatingSystem,
  ServerServiceType,
  ServerPerformanceScale,
  ServerManageStorage,
  ServerNetwork,
  ServerIpAddress,
  ServerImageType,
  ServerCatalogItem,
  ServerCatalogItemType
} from '../../models';
import { CreateServerBase } from '../create-server.base';
import { ServersOsRepository } from '../../servers-os.repository';
import { ServersService } from '../../servers.service';

@Component({
  selector: 'mcs-new-server',
  templateUrl: 'new-server.component.html'
})

export class NewServerComponent extends CreateServerBase implements OnInit, OnDestroy {
  @Input()
  public serviceType: ServerServiceType;

  public textContent: any;
  public textHelpContent: any;
  public operatingSystemsMap: Map<string, ServerOperatingSystem[]>;
  public operatingSystemsSubscription: Subscription;
  public selectedNetwork: ServerNetwork;
  public customTemplates: ServerCatalogItem[];

  // Form variables
  public fgNewServer: FormGroup;
  public fcServerName: FormControl;
  public fcVApp: FormControl;
  public fcImage: FormControl;
  public fcNetwork: FormControl;
  public fcScale: FormControl;
  public fcStorage: FormControl;
  public fcIpAddress: FormControl;

  @Input()
  public get resource(): ServerResource { return this._resource; }
  public set resource(value: ServerResource) {
    if (this._resource !== value) {
      this._resource = value;
    }
  }
  private _resource: ServerResource;

  constructor(
    private _textContentProvider: McsTextContentProvider,
    private _errorHandlerService: McsErrorHandlerService,
    private _serversService: ServersService,
    private _serversOsRepository: ServersOsRepository
  ) {
    super(ServerCreateType.New);
    this.operatingSystemsMap = new Map<string, ServerOperatingSystem[]>();
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.servers.createServer.newServer;
    this.textHelpContent = this._textContentProvider.content.servers.createServer.contextualHelp;
    this._registerFormGroup();
    this._getServersOs();
    this._getCustomTemplates();
  }

  public ngOnDestroy() {
    // Do something
  }

  public get scaleAvailableMemoryMB(): number {
    return this._serversService.computeAvailableMemoryMB(this.resource);
  }

  public get scaleAvailableCpuCount(): number {
    return this._serversService.computeAvailableCpu(this.resource);
  }

  public get scaleMemoryMB(): number {
    return CoreDefinition.CREATE_SERVER_MINIMUM_RAM;
  }

  public get scaleCpuCount(): number {
    return CoreDefinition.CREATE_SERVER_MINIMUM_CPU;
  }

  public get storageMinMemoryMB(): number {
    return CoreDefinition.CREATE_SERVER_MINIMUM_STORAGE;
  }

  public get storageSliderStep(): number {
    return CoreDefinition.CREATE_SERVER_STORAGE_STEP;
  }

  /**
   * Returns the storage warning text
   */
  public get storageWarning(): string {
    let maxMemoryInGb = Math.floor(convertMbToGb(this.storageMaxMemoryMB));

    return replacePlaceholder(
      this.textContent.fullStorageSpace,
      'remaining_memory',
      appendUnitSuffix(maxMemoryInGb, McsUnitType.Gigabyte)
    );
  }

  /**
   * Returns the server max available storage measured in MB
   *
   * `@Note`: The value will vary according to selected CPU scale
   */
  public get storageMaxMemoryMB(): number {
    if (isNullOrEmpty(this.fcStorage.value)) { return 0; }

    let serverStorage = this.fcStorage.value as ServerManageStorage;
    let resourceStorage = this.resource.storage.find((resource) => {
      return resource.name === serverStorage.storageProfile;
    });
    if (isNullOrEmpty(resourceStorage)) { return 0; }
    let currentSelectedScale = this.fcScale.value && this.fcScale.value.memoryMB;
    return this._serversService.computeAvailableStorageMB(resourceStorage, currentSelectedScale);
  }

  /**
   * Event that emits when the performance scale component has changed
   * @param serverScale Server Scale Result
   */
  public onScaleChanged(serverScale: ServerPerformanceScale) {
    if (isNullOrEmpty(this.fcScale)) { return; }
    serverScale.valid ? this.fcScale.setValue(serverScale) : this.fcScale.reset();
  }

  /**
   * Event that emits when the storage scale component has changed
   * @param serverStorage Server Storage Result
   */
  public onStorageChanged(serverStorage: ServerManageStorage) {
    if (isNullOrEmpty(this.fcStorage) || isNullOrEmpty(this.resource)) { return; }
    serverStorage.valid ? this.fcStorage.setValue(serverStorage) : this.fcStorage.reset();
  }

  /**
   * Event that emits when IP Address component has changed
   * @param ipAddress Ip address emitted value
   */
  public onIpAddressChanged(ipAddress: ServerIpAddress): void {
    if (isNullOrEmpty(this.fcIpAddress)) { return; }
    ipAddress.valid ? this.fcIpAddress.setValue(ipAddress) : this.fcIpAddress.reset();
  }

  /**
   * Converts the character to maximum input
   */
  public convertMaxCharText(text: string, maxchar: number): string {
    return replacePlaceholder(text, 'max_char', maxchar.toString());
  }

  /**
   * Returns the creation details input
   */
  public getCreationInputs(): ServerCreateDetails {
    let formIsValid = !isNullOrEmpty(this.fgNewServer) && this.fgNewServer.valid;
    if (!formIsValid) { return; }

    // Set the corresponding attribute to create the server
    let newServerInputs = new ServerCreateDetails();
    newServerInputs.serverName = this.fcServerName.value;
    newServerInputs.vApp = this.fcVApp.value;
    newServerInputs.performanceScale = this.fcScale.value;
    newServerInputs.serverManageStorage = this.fcStorage.value;
    newServerInputs.network = this.fcNetwork.value;
    newServerInputs.ipAddress = this.fcIpAddress.value;

    // Set image based on type Os/Template
    let selectedImage = this.fcImage.value;
    if (selectedImage instanceof ServerOperatingSystem) {
      newServerInputs.image = selectedImage.name;
      newServerInputs.imageType = ServerImageType.Os;
    } else {
      newServerInputs.image = selectedImage.name;
      newServerInputs.imageType = ServerImageType.Template;
    }
    return newServerInputs;
  }

  /**
   * Returns the creation form group
   */
  public getCreationForm(): FormGroup {
    return this.fgNewServer;
  }

  /**
   * Gets the servers operating systems from repository
   */
  private _getServersOs(): void {
    this.operatingSystemsSubscription = this._serversOsRepository.findAllRecords()
      .catch((error) => {
        // Handle common error status code
        this._errorHandlerService.handleHttpRedirectionError(error.status);
        return Observable.throw(error);
      })
      .subscribe((response: ServerOperatingSystem[]) => {
        this._filterOsGroup(response);
      });
  }

  /**
   * Filters the OS group and create the mapping
   * @param operatingSystems Operating systems to be grouped
   */
  private _filterOsGroup(operatingSystems: ServerOperatingSystem[]): void {
    if (isNullOrEmpty(operatingSystems)) { return; }

    operatingSystems.forEach((operatingSystem) => {
      if (operatingSystem.serviceType !== this.serviceType) { return; }

      let keyString = operatingSystem.name.split(CoreDefinition.REGEX_SPACE_AND_DASH);
      if (isNullOrEmpty(keyString)) { return; }
      let groupedOs: ServerOperatingSystem[];

      let existingOs = this.operatingSystemsMap.get(keyString[0]);
      groupedOs = isNullOrEmpty(existingOs) ? new Array() : existingOs;
      groupedOs.push(operatingSystem);
      this.operatingSystemsMap.set(keyString[0], groupedOs);
    });
  }

  /**
   * Get custom templates from the catalog items
   */
  private _getCustomTemplates(): void {
    if (isNullOrEmpty(this.resource)) { return; }

    let filteredCatalogItems = this.resource.catalogItems.filter((catalog) => {
      return catalog.itemType === ServerCatalogItemType.Template;
    });

    if (!isNullOrEmpty(filteredCatalogItems)) {
      this.customTemplates = filteredCatalogItems;
    }
  }

  /**
   * Registers the form group including its form fields
   */
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
  }

  /**
   * Returns true when server name is valid
   * @param inputValue Inputted value from input box
   */
  private _customServerNameValidator(inputValue: any): boolean {
    return CoreDefinition.REGEX_SERVER_NAME_PATTERN.test(inputValue);
  }
}
