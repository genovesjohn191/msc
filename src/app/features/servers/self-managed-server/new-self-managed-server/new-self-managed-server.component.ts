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
  CoreValidators,
  CoreDefinition
} from '../../../../core';
import {
  refreshView,
  mergeArrays,
  animateFactory,
  isNullOrEmpty,
  convertToGb
} from '../../../../utilities';
import { CreateSelfManagedServersService } from '../create-self-managed-servers.service';
import { ContextualHelpDirective } from '../../shared/contextual-help/contextual-help.directive';
import {
  ServerManageStorage,
  ServerPerformanceScale,
  ServerIpAddress,
  ServerCreateSelfManaged,
  ServerResource,
  ServerStorage,
  ServerNetwork,
  ServerTemplate
} from '../../models';

const NEW_SERVER_STORAGE_SLIDER_STEP = 10;
const NEW_SERVER_WIN_STORAGE_SLIDER_MINIMUM_MB = 30 * CoreDefinition.GB_TO_MB_MULTIPLIER;

@Component({
  selector: 'mcs-new-self-managed-server',
  templateUrl: './new-self-managed-server.component.html',
  styles: [require('./new-self-managed-server.component.scss')],
  animations: [
    animateFactory({ duration: '500ms' })
  ]
})

export class NewSelfManagedServerComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  public visible: boolean;

  @Input()
  public resource: ServerResource;

  @Input()
  public template: ServerTemplate;

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
  public memoryMB: number;
  public cpuCount: number;
  public storageMemoryMB: number;
  public selectedNetwork: ServerNetwork;
  public storageSliderValues: number[];
  public storageAvailableMemoryMB: number;
  public selectedStorage: ServerManageStorage;

  // Dropdowns
  public vAppItems: McsList;
  public vTemplateItems: McsList;
  public networkItems: McsList;
  public storageItems: McsList;

  // Others
  public contextualTextContent: any;
  public availableMemoryMB: number;
  public availableCpuCount: number;

  public constructor(
    private _managedServerService: CreateSelfManagedServersService,
    private _textContentProvider: McsTextContentProvider
  ) {
    this.memoryMB = 0;
    this.cpuCount = 0;
    this.storageMemoryMB = 0;
    this.availableMemoryMB = 0;
    this.availableCpuCount = 0;
    this.storageSliderValues = new Array<number>();
    this.storageAvailableMemoryMB = 0;
    this.selectedStorage = new ServerManageStorage();

    this.vAppItems = new McsList();
    this.vTemplateItems = new McsList();
    this.networkItems = new McsList();
    this.storageItems = new McsList();
    this.selectedNetwork = new ServerNetwork();
    this.onOutputServerDetails = new EventEmitter<ServerCreateSelfManaged>();
  }

  public ngOnInit() {
    this.contextualTextContent = this._textContentProvider.content
      .servers.createSelfManagedServer.contextualHelp;

    // TODO: Temporary value. To be confirmed
    this.storageMemoryMB = NEW_SERVER_WIN_STORAGE_SLIDER_MINIMUM_MB;

    this._registerFormGroup();

    if (this.resource) {
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
    this.availableMemoryMB = this.resource.memoryLimitMB - this.resource.memoryUsedMB;
  }

  private _setAvailableCpuCount(): void {
    this.availableCpuCount = this.resource.cpuLimit - this.resource.cpuUsed;
  }

  private _setVAppItems(): void {
    if (isNullOrEmpty(this.resource)) { return; }

    // Populate dropdown list
    this.resource.storage.forEach((storage) => {
      this.vAppItems.push('Virtual Applications', new McsListItem(storage.name, storage.name));
    });
    // Select first element of the dropdown
    if (!isNullOrEmpty(this.vAppItems.getGroupNames())) {
      this.formControlVApp.setValue(this.vAppItems.getGroup(
        this.vAppItems.getGroupNames()[0])[0].value);
    }
  }

  private _setVTemplateItems(): void {
    if (isNullOrEmpty(this.template)) { return; }

    // Populate dropdown list
    this.template.guestOs.forEach((guestOs) => {
      this.vTemplateItems.push('Virtual Templates',
        new McsListItem(guestOs.name, guestOs.description));
    });
    // Select first element of the dropdown
    if (!isNullOrEmpty(this.vTemplateItems.getGroupNames())) {
      this.formControlVTemplate.setValue(this.vTemplateItems.getGroup(
        this.vTemplateItems.getGroupNames()[0])[0].value);
    }
  }

  private _setNetworkItems(): void {
    if (isNullOrEmpty(this.resource)) { return; }

    // Populate dropdown list
    this.resource.networks.forEach((network) => {
      this.networkItems.push('Networks', new McsListItem(network.name, network.name));
    });
    // Select first element of the dropdown
    if (!isNullOrEmpty(this.networkItems.getGroupNames())) {
      this.formControlNetwork.setValue(this.networkItems.getGroup(
        this.networkItems.getGroupNames()[0])[0].key);
    }
  }

  private _setStorageItems(): void {
    if (isNullOrEmpty(this.resource)) { return; }

    // Populate dropdown list
    this.resource.storage.forEach((storage) => {
      this.storageItems.push('Storages', new McsListItem(storage.name, storage.name));
    });
    // The selection of element is happened under onStorageChanged method
  }

  private _setStorageAvailableMemoryMB(): void {
    let availableMemoryMB = 0;
    let serverStorage = this.formControlStorage.value as ServerManageStorage;

    if (serverStorage) {
      let storageProfile = this.resource.storage
        .find((profile) => {
          return profile.name === serverStorage.storageProfile;
        });

      if (storageProfile) {
        availableMemoryMB = storageProfile.limitMB - storageProfile.usedMB;
        if (availableMemoryMB < 0) { availableMemoryMB = 0; }
      }
    }

    this.storageAvailableMemoryMB = availableMemoryMB;
  }

  private _setStorageSliderValues(): void {
    if (isNullOrEmpty(this.storageAvailableMemoryMB)) { return; }

    let memoryGB = Math.floor(convertToGb(this.storageMemoryMB));
    let maximumMemoryGB = memoryGB + Math.floor(convertToGb(this.storageAvailableMemoryMB));

    this.storageSliderValues = new Array<number>();
    this.storageSliderValues.push(memoryGB);
    for (let value = memoryGB; value < maximumMemoryGB;) {
      if ((value + NEW_SERVER_STORAGE_SLIDER_STEP) <= maximumMemoryGB) {
        value += NEW_SERVER_STORAGE_SLIDER_STEP;
      } else {
        value = maximumMemoryGB;
      }

      this.storageSliderValues.push(value);
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
      // formControlVapp: this.formControlVApp,
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
    newSelfManaged.networkName = this.formControlNetwork.value;
    newSelfManaged.performanceScale = this.formControlScale.value;
    newSelfManaged.serverManageStorage = this.formControlStorage.value;
    newSelfManaged.ipAddress = this.formControlIpAddress.value;
    newSelfManaged.isValid = this.formGroupNewServer.valid;

    this.onOutputServerDetails.next(newSelfManaged);
  }
}
