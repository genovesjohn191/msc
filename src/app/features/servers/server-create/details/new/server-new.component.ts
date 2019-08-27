import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import {
  FormGroup,
  FormControl
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {
  Subscription,
  Observable,
  of,
  Subject
} from 'rxjs';
import {
  switchMap,
  takeUntil
} from 'rxjs/operators';
import {
  CoreDefinition,
  CoreValidators,
  IMcsFormGroup
} from '@app/core';
import {
  replacePlaceholder,
  isNullOrEmpty,
  appendUnitSuffix,
  convertMbToGb,
  convertGbToMb,
  getSafeProperty,
  unsubscribeSafely
} from '@app/utilities';
import {
  CatalogItemType,
  ServiceType,
  UnitType,
  McsResource,
  McsResourceStorage,
  McsResourceCatalogItem,
  McsServerCreate,
  McsServerCreateStorage,
  McsServerCreateNic,
  McsServerOperatingSystem,
  McsServerCreateOs,
  OsType,
  Os
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  ServerManageStorage,
  ServerManageNetwork,
  ServerManageScale
} from '@app/features-shared';
import { McsFormGroupDirective } from '@app/shared';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import { McsEvent } from '@app/events';
import { ServerCreateDetailsBase } from '../server-create-details.base';

const DEFAULT_MANAGE_STORAGE_MINIMUM = 50;
const DEFAULT_SELF_MANAGE_STORAGE_MINIMUM = 30;
const DEFAULT_OS_VENDOR = 'Other';

@Component({
  selector: 'mcs-server-new',
  templateUrl: 'server-new.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ServerNewComponent
  extends ServerCreateDetailsBase<McsServerCreate>
  implements OnInit, AfterViewInit, OnDestroy {

  @Input()
  public serviceType: ServiceType;

  public operatingSystemsMap$: Observable<Map<string, McsServerOperatingSystem[]>>;
  public operatingSystemsSubscription: Subscription;
  public selectedStorage: McsResourceStorage;
  public customTemplates: McsResourceCatalogItem[];

  public manageScale: ServerManageScale;
  public manageStorage: ServerManageStorage;
  public manageNetwork: ServerManageNetwork;

  // Form variables
  public fgNewServer: FormGroup;
  public fgScale: FormGroup;
  public fgStorage: FormGroup;
  public fgNetwork: FormGroup;

  public fcServerName: FormControl;
  public fcVApp: FormControl;
  public fcImage: FormControl;
  public fcNetwork: FormControl;
  public fcScale: FormControl;
  public fcStorage: FormControl;

  @Output()
  public dataChange = new EventEmitter<ServerCreateDetailsBase<McsServerCreate>>();

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

  @ViewChild('fgManageScale')
  private _fgManageScale: IMcsFormGroup;

  @ViewChild('fgManageStorage')
  private _fgManageStorage: IMcsFormGroup;

  @ViewChild('fgManageNetwork')
  private _fgManageNetwork: IMcsFormGroup;

  @ViewChild(McsFormGroupDirective)
  private _formGroup: McsFormGroupDirective;

  private _destroySubject = new Subject<void>();
  private _resourcesDataChangeHandler: Subscription;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _translate: TranslateService,
    private _eventDispatcher: EventBusDispatcherService,
    private _apiService: McsApiService
  ) {
    super();
    this._registerDataEvents();
  }

  public ngOnInit() {
    this._registerFormGroup();
  }

  public ngAfterViewInit() {
    Promise.resolve().then(() => {
      this._registerNestedFormGroups();
    });
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._resourcesDataChangeHandler);
  }

  public get resourceIsManaged(): boolean {
    return this.serviceType === ServiceType.Managed;
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
    let maxMemoryInGB = Math.floor(this.storageMaxMemoryGB);

    return this._translate.instant('serverCreateDetailsStep.newServer.fullStorageSpace', {
      remaining_memory: appendUnitSuffix(maxMemoryInGB, UnitType.Gigabyte)
    });
  }

  /**
   * Returns the server max available storage measured in GB
   *
   * `@Note`: The value will vary according to selected CPU scale
   */
  public get storageMaxMemoryGB(): number {
    let currentSelectedScale = getSafeProperty(this.manageScale, (obj) => obj.memoryGB);
    let storageAvailableMB = getSafeProperty(this.selectedStorage, (obj) => obj.availableMB, 0);
    return Math.max(0, (convertMbToGb(storageAvailableMB) - currentSelectedScale));
  }

  /**
   * Returns the current scale value to deduct in the storage
   */
  public get currentScaleValue(): number {
    let currentSelectedScale = getSafeProperty(this.manageScale, (obj) => obj.memoryGB);
    return currentSelectedScale;
  }

  /**
   * Returns true when the form is valid
   */
  public get formIsValid(): boolean {
    return !isNullOrEmpty(this.fgNewServer) && this.fgNewServer.valid;
  }

  /**
   * Event that emits when the performance scale component has changed
   * @param serverScale Server Scale Result
   */
  public onScaleChanged(serverScale: ServerManageScale) {
    this.manageScale = serverScale;
  }

  /**
   * Event that emits when the storage scale component has changed
   * @param serverStorage Server Storage Result
   */
  public onStorageChanged(serverStorage: ServerManageStorage) {
    this.manageStorage = serverStorage;
    this.selectedStorage = serverStorage.storage;
  }

  /**
   * Event that emits when network settings component has changed
   * @param network Server network output to be emitted
   */
  public onNetworkChanged(network: ServerManageNetwork): void {
    this.manageNetwork = network;
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

    // Os
    let selectedImage = this.fcImage.value;
    serverCreate.os = new McsServerCreateOs();
    if (selectedImage instanceof McsServerOperatingSystem) {
      serverCreate.os.name = selectedImage.name;
      serverCreate.os.type = OsType.Image;
    } else {
      serverCreate.os.name = selectedImage.itemName;
      serverCreate.os.type = OsType.Template;
    }

    // Scale
    serverCreate.cpuCount = this.manageScale.cpuCount;
    serverCreate.memoryMB = convertGbToMb(this.manageScale.memoryGB);

    // Storage
    serverCreate.storage = new McsServerCreateStorage();
    serverCreate.storage.name = this.manageStorage.storage.name;
    serverCreate.storage.sizeMB = this.manageStorage.sizeMB;

    // Network
    serverCreate.network = new McsServerCreateNic();
    serverCreate.network.name = this.manageNetwork.network.name;
    serverCreate.network.ipAllocationMode = this.manageNetwork.ipAllocationMode;
    serverCreate.network.ipAddress = this.manageNetwork.customIpAddress;

    return serverCreate;
  }

  /**
   * Returns the os type of the server
   */
  public getCreationOsType(): Os {
    let imageOsType = getSafeProperty(this.fcImage, (obj) => obj.value.type);
    return imageOsType === 'WIN' ? Os.Windows : Os.Linux;
  }

  /**
   * Returns the creation form group
   */
  public getCreationForm(): McsFormGroupDirective {
    return this._formGroup;
  }

  /**
   * Gets the servers operating systems from repository
   */
  private _getServersOs(): void {
    this.operatingSystemsMap$ = this._apiService.getServerOs().pipe(
      switchMap((response) => of(this._filterOsGroup(response && response.collection)))
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
      let osVendor = operatingSystem.vendor || DEFAULT_OS_VENDOR;
      let groupedOs: McsServerOperatingSystem[];

      let existingOs = operatingSystemsMap.get(osVendor);
      groupedOs = isNullOrEmpty(existingOs) ? new Array() : existingOs;
      groupedOs.push(operatingSystem);
      operatingSystemsMap.set(osVendor, groupedOs);
    });
    return operatingSystemsMap;
  }

  /**
   * Get custom templates from the catalog items
   */
  private _getCustomTemplates(): void {
    let hasCatalogItems = !isNullOrEmpty(this.resource) &&
      !isNullOrEmpty(this.resource.catalogs);
    if (!hasCatalogItems) { return; }

    let catalogItems: McsResourceCatalogItem[] = [];
    this.resource.catalogs.forEach((catalog) => {
      catalogItems.push(...catalog.items.filter(
        (catalogItem) => catalogItem.type === CatalogItemType.Template)
      );
    });

    if (!isNullOrEmpty(catalogItems)) {
      this.customTemplates = catalogItems;
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

    // Register Form Groups using binding
    this.fgNewServer = new FormGroup({
      fcServerName: this.fcServerName,
      fcVApp: this.fcVApp,
      fcImage: this.fcImage,
    });
    this.fgNewServer.valueChanges.pipe(
      takeUntil(this._destroySubject)
    ).subscribe(this._notifyDataChange.bind(this));
  }

  /**
   * Registers nested form groups
   */
  private _registerNestedFormGroups(): void {
    if (!isNullOrEmpty(this._fgManageScale)) {
      this.fgNewServer.addControl('fgScale',
        this._fgManageScale.getFormGroup().formGroup);
    }

    if (!isNullOrEmpty(this._fgManageStorage)) {
      this.fgNewServer.addControl('fgStorage',
        this._fgManageStorage.getFormGroup().formGroup);
    }

    if (!isNullOrEmpty(this._fgManageNetwork)) {
      this.fgNewServer.addControl('fgNetwork',
        this._fgManageNetwork.getFormGroup().formGroup);
    }
  }

  /**
   * Returns true when server name is valid
   * @param inputValue Inputted value from input box
   */
  private _customServerNameValidator(inputValue: any): boolean {
    return CoreDefinition.REGEX_SERVER_NAME_PATTERN.test(inputValue);
  }

  /**
   * Notifies the data change on the form
   */
  private _notifyDataChange(): void {
    Promise.resolve().then(() => {
      if (!this.formIsValid) { return; }
      this.dataChange.next(this);
    });
  }

  /**
   * Registers the data events
   */
  private _registerDataEvents(): void {
    this._resourcesDataChangeHandler = this._eventDispatcher.addEventListener(
      McsEvent.dataChangeResources, this._onResourcesDataChanged.bind(this));
  }

  /**
   * Event that emits when the server data has been changed
   */
  private _onResourcesDataChanged(): void {
    this._changeDetectorRef.markForCheck();
    console.log('resource changed');
  }
}
