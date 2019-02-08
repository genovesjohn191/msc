import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import {
  FormGroup,
  FormControl
} from '@angular/forms';
import {
  Subscription,
  throwError,
  Observable,
  of,
  Subject
} from 'rxjs';
import {
  catchError,
  switchMap,
  takeUntil
} from 'rxjs/operators';
import {
  McsErrorHandlerService,
  McsTextContentProvider,
  CoreDefinition,
  CoreValidators
} from '@app/core';
import {
  replacePlaceholder,
  isNullOrEmpty,
  appendUnitSuffix,
  convertMbToGb,
  getSafeProperty,
  unsubscribeSafely
} from '@app/utilities';
import {
  CatalogItemType,
  ServiceType,
  ServerImageType,
  UnitType,
  McsResource,
  McsResourceStorage,
  McsResourceCatalogItem,
  McsServerCreate,
  McsServerCreateStorage,
  McsServerCreateNic,
  McsServerOperatingSystem
} from '@app/models';
import {
  McsServersOsRepository,
  McsResourcesRepository
} from '@app/services';
import {
  ServerManageStorage,
  ServerManageNetwork,
  ServerManageScale,
} from '../../../shared';
import { ServerCreateDetailsBase } from '../server-create-details.base';

const DEFAULT_MANAGE_STORAGE_MINIMUM = 50;
const DEFAULT_SELF_MANAGE_STORAGE_MINIMUM = 30;

@Component({
  selector: 'mcs-server-new',
  templateUrl: 'server-new.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ServerNewComponent
  extends ServerCreateDetailsBase<McsServerCreate>
  implements OnInit, OnDestroy {

  @Input()
  public serviceType: ServiceType;

  public textContent: any;
  public textHelpContent: any;
  public operatingSystemsMap$: Observable<Map<string, McsServerOperatingSystem[]>>;
  public operatingSystemsSubscription: Subscription;
  public selectedStorage: McsResourceStorage;
  public customTemplates: McsResourceCatalogItem[];

  // Form variables
  public fgNewServer: FormGroup;
  public fcServerName: FormControl;
  public fcVApp: FormControl;
  public fcImage: FormControl;
  public fcNetwork: FormControl;
  public fcScale: FormControl;
  public fcStorage: FormControl;

  private _destroySubject = new Subject<void>();

  @Input()
  public get resource(): McsResource { return this._resource; }
  public set resource(value: McsResource) {
    if (this._resource !== value) {
      this._resource = value;
      this._getServersOs();
      this._getCustomTemplates();
      this._changeDetectorRef.markForCheck();
    }
  }
  private _resource: McsResource;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider,
    private _errorHandlerService: McsErrorHandlerService,
    private _serversOsRepository: McsServersOsRepository,
    private _resourcesRepository: McsResourcesRepository
  ) {
    super();
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.servers.createServer.newServer;
    this.textHelpContent = this._textContentProvider.content.servers.createServer.contextualHelp;
    this._registerFormGroup();
    this._subscribeToResourceDataChange();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
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
   * Returns the minimum storage in GB
   */
  public get minimumStorageInGB(): number {
    return this.serviceType === ServiceType.Managed ?
      DEFAULT_MANAGE_STORAGE_MINIMUM :
      DEFAULT_SELF_MANAGE_STORAGE_MINIMUM;
  }

  /**
   * Returns the storage warning text
   */
  public get storageWarning(): string {
    let maxMemoryInGb = Math.floor(convertMbToGb(this.storageMaxMemoryMB));

    return replacePlaceholder(
      this.textContent.fullStorageSpace,
      'remaining_memory',
      appendUnitSuffix(maxMemoryInGb, UnitType.Gigabyte)
    );
  }

  /**
   * Returns the server max available storage measured in MB
   *
   * `@Note`: The value will vary according to selected CPU scale
   */
  public get storageMaxMemoryMB(): number {
    let currentSelectedScale = this.fcScale.value && this.fcScale.value.memoryMB;
    let storageAvailable = getSafeProperty(this.selectedStorage, (obj) => obj.availableMB, 0);
    return Math.max(0, (storageAvailable - currentSelectedScale));
  }

  /**
   * Returns the current scale value to deduct in the storage
   */
  public get currentScaleValue(): number {
    let currentSelectedScale = this.fcScale.value && this.fcScale.value.memoryMB;
    return convertMbToGb(currentSelectedScale);
  }

  /**
   * Event that emits when the performance scale component has changed
   * @param serverScale Server Scale Result
   */
  public onScaleChanged(serverScale: ServerManageScale) {
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
    this.selectedStorage = serverStorage.storage;
  }

  /**
   * Event that emits when network settings component has changed
   * @param network Server network output to be emitted
   */
  public onNetworkChanged(network: ServerManageNetwork): void {
    if (isNullOrEmpty(this.fcNetwork)) { return; }
    network.valid ? this.fcNetwork.setValue(network) : this.fcNetwork.reset();
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
  public getCreationInputs(): McsServerCreate {
    let formIsValid = !isNullOrEmpty(this.fgNewServer) && this.fgNewServer.valid;
    if (!formIsValid) { return; }

    // Set the corresponding attribute to create the server
    let serverCreate = new McsServerCreate();
    serverCreate.platform = this.resource.platformLabel;
    serverCreate.resource = this.resource.name;
    serverCreate.name = this.fcServerName.value;
    serverCreate.target = getSafeProperty(this.fcVApp, (obj) => obj.value.name);

    // Scale
    let serverScale = this.fcScale.value as ServerManageScale;
    serverCreate.cpuCount = serverScale.cpuCount;
    serverCreate.memoryMB = serverScale.memoryMB;

    // Storage
    let serverStorage = this.fcStorage.value as ServerManageStorage;
    serverCreate.storage = new McsServerCreateStorage();
    serverCreate.storage.name = serverStorage.storage.name;
    serverCreate.storage.sizeMB = serverStorage.sizeMB;

    // Network
    let serverNetwork = this.fcNetwork.value as ServerManageNetwork;
    serverCreate.network = new McsServerCreateNic();
    serverCreate.network.name = serverNetwork.network.name;
    serverCreate.network.ipAllocationMode = serverNetwork.ipAllocationMode;
    serverCreate.network.ipAddress = serverNetwork.customIpAddress;

    // VM Image
    let selectedImage = this.fcImage.value;
    if (selectedImage instanceof McsServerOperatingSystem) {
      serverCreate.image = selectedImage.name;
      serverCreate.imageType = ServerImageType.Os;
    } else {
      serverCreate.image = selectedImage.itemName;
      serverCreate.imageType = ServerImageType.Template;
    }
    return serverCreate;
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
    this.operatingSystemsMap$ = this._serversOsRepository.getAll().pipe(
      catchError((error) => {
        // Handle common error status code
        this._errorHandlerService.redirectToErrorPage(error.status);
        return throwError(error);
      }),
      switchMap((_response) => of(this._filterOsGroup(_response)))
    );
  }

  /**
   * Filters the OS group and create the mapping
   * @param operatingSystems Operating systems to be grouped
   */
  private _filterOsGroup(operatingSystems: McsServerOperatingSystem[]) {
    if (isNullOrEmpty(operatingSystems)) { return; }
    let operatingSystemsMap: Map<string, McsServerOperatingSystem[]> = new Map();

    operatingSystems.forEach((operatingSystem) => {
      if (operatingSystem.serviceType !== this.serviceType) { return; }

      let keyString = operatingSystem.name.split(CoreDefinition.REGEX_SPACE_AND_DASH);
      if (isNullOrEmpty(keyString)) { return; }
      let groupedOs: McsServerOperatingSystem[];

      let existingOs = operatingSystemsMap.get(keyString[0]);
      groupedOs = isNullOrEmpty(existingOs) ? new Array() : existingOs;
      groupedOs.push(operatingSystem);
      operatingSystemsMap.set(keyString[0], groupedOs);
    });
    return operatingSystemsMap;
  }

  /**
   * Get custom templates from the catalog items
   */
  private _getCustomTemplates(): void {
    let hasCatalogItems = !isNullOrEmpty(this.resource) &&
      !isNullOrEmpty(this.resource.catalogItems);
    if (!hasCatalogItems) { return; }

    let filteredCatalogItems = this.resource.catalogItems.filter((catalog) => {
      return catalog.itemType === CatalogItemType.Template;
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

    // Register Form Groups using binding
    this.fgNewServer = new FormGroup({
      fcServerName: this.fcServerName,
      fcVApp: this.fcVApp,
      fcImage: this.fcImage,
      fcNetwork: this.fcNetwork,
      fcScale: this.fcScale,
      fcStorage: this.fcStorage
    });
  }

  /**
   * Returns true when server name is valid
   * @param inputValue Inputted value from input box
   */
  private _customServerNameValidator(inputValue: any): boolean {
    return CoreDefinition.REGEX_SERVER_NAME_PATTERN.test(inputValue);
  }

  /**
   * Subscribes to resource data changes and update the DOM
   */
  private _subscribeToResourceDataChange(): void {
    this._resourcesRepository.dataChange().pipe(
      takeUntil(this._destroySubject)
    ).subscribe(() => this._changeDetectorRef.markForCheck());
  }
}
