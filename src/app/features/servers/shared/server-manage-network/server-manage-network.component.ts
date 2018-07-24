import {
  Component,
  OnInit,
  OnChanges,
  Input,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
  SimpleChanges
} from '@angular/core';
import {
  FormGroup,
  FormControl
} from '@angular/forms';
import { Subject } from 'rxjs';
import {
  finalize,
  takeUntil
} from 'rxjs/operators';
import {
  replacePlaceholder,
  isNullOrEmpty,
  animateFactory,
  clearArrayRecord,
  getSafeProperty
} from '../../../../utilities';
import {
  McsTextContentProvider,
  McsOption,
  CoreValidators,
  McsDataStatusFactory
} from '../../../../core';
import {
  ResourceNetwork,
  ResourceNetworkIpAddress,
  ResourcesService
} from '../../../resources';
import {
  ServerInputManageType,
  ServerIpAllocationMode,
  ServerManageNetwork,
  ServerNic
} from '../../models';

// Constants
const DEFAULT_GATEWAY = '192.168.0.1';
const DEFAULT_NETMASK = '255.255.255.0';

// Require subnetting javscript class
const Netmask = require('netmask').Netmask;

@Component({
  selector: 'mcs-server-manage-network',
  templateUrl: 'server-manage-network.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.fadeIn,
    animateFactory.fadeInOut
  ],
  host: {
    'class': 'server-manage-network-wrapper block block-items-medium'
  }
})

export class ServerManageNetworkComponent implements OnInit, OnChanges {
  public textContent: any;
  public netMask: any;
  public selectedIpAddressMode: ServerIpAllocationMode;
  public ipAddressesInUsed: ResourceNetworkIpAddress[];
  public ipAddressItems: McsOption[];
  public inputManageType: ServerInputManageType;
  public ipAddressessStatusFactory = new McsDataStatusFactory<ResourceNetworkIpAddress[]>();

  // Form variables
  public fgCustomIpAddress: FormGroup;
  public fcCustomIpAddress: FormControl;

  @Output()
  public dataChange = new EventEmitter<ServerManageNetwork>();

  @Output()
  public selectedNetworkChange = new EventEmitter<ResourceNetwork>();

  @Input()
  public resourceId: string;

  @Input()
  public networks: ResourceNetwork[];

  @Input()
  public targetNic: ServerNic;

  @Input()
  public get selectedNetwork(): ResourceNetwork { return this._selectedNetwork; }
  public set selectedNetwork(value: ResourceNetwork) {
    if (this._selectedNetwork !== value) {
      this._selectedNetwork = value;
      this.selectedNetworkChange.emit(this._selectedNetwork);
      this._resetFormGroup();
      this._createNetmaskByNetwork(this._selectedNetwork);
      this._setInUsedIpAddresses(this._selectedNetwork);
      this._notifyDataChanged();
    }
  }
  private _selectedNetwork: ResourceNetwork;

  private _networkOutput = new ServerManageNetwork();
  private _destroySubject = new Subject<void>();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider,
    private _resourcesService: ResourcesService
  ) {
    this.inputManageType = ServerInputManageType.Buttons;
    this.selectedIpAddressMode = ServerIpAllocationMode.Dhcp;
    this.ipAddressItems = new Array();
    this.ipAddressesInUsed = new Array();
    this.netMask = new Netmask(`${DEFAULT_GATEWAY}/${DEFAULT_NETMASK}`);
    this._registerFormGroup();
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content
      .servers.shared.manageNetwork;
    this._setIpAddressItems();
    this._setSelectedNetwork();
    this._initializeCurrentView();
    this._notifyDataChanged();
  }

  public ngOnChanges(changes: SimpleChanges) {
    let networksChange = changes['networks'];
    if (!isNullOrEmpty(networksChange)) {
      this._setSelectedNetwork();
    }
  }

  /**
   * Returns the server input managetype enumeration instance
   */
  public get inputManageTypeEnum(): any {
    return ServerInputManageType;
  }

  /**
   * Returns the ip range error text content
   */
  public get ipRangeErrorText(): string {
    return replacePlaceholder(
      this.textContent.errors.ipAddressRangeError,
      'ip_range',
      `${this.netMask.first} - ${this.netMask.last}`
    );
  }

  /**
   * Event that emits when the input manage type has been changed
   */
  public onChangeInputManageType(inputManageType: ServerInputManageType) {
    this.inputManageType = inputManageType;
    this._notifyDataChanged();
  }

  /**
   * Event that emits when the radio button selection has been changed
   * @param inputValue Server allocation mode of the radio button
   */
  public onRadioButtonChanged(inputValue: ServerIpAllocationMode) {
    this.selectedIpAddressMode = inputValue;
    this._notifyDataChanged();
  }

  /**
   * Returns true when the inputted ip-address is inused
   * @param ipAddress Ip address to be checked
   */
  public isIpAddressInUsed(ipAddress: string): boolean {
    if (isNullOrEmpty(ipAddress)) { return false; }
    return !!this.ipAddressesInUsed.find((inUsed) => ipAddress === inUsed.ipAddress);
  }

  /**
   * Create the instance of the netmask based on the provided network
   * @param network Network to be considered
   */
  private _createNetmaskByNetwork(network: ResourceNetwork): void {
    if (isNullOrEmpty(network)) { return; }
    this.netMask = new Netmask(`${network.gateway}/${network.netmask}`);
  }

  /**
   * Sets the ip-addresses in used in the current network selected
   * @param network Network currently selected
   */
  private _setInUsedIpAddresses(network: ResourceNetwork): void {
    if (isNullOrEmpty(network)) { return; }
    this.ipAddressessStatusFactory.setInProgress();
    this._resourcesService.getResourceNetwork(this.resourceId, network.id)
      .pipe(
        finalize(() => this.ipAddressessStatusFactory.setSuccessful(this.ipAddressesInUsed))
      )
      .subscribe((response) => {
        if (isNullOrEmpty(response)) { return; }
        this.ipAddressesInUsed = response.content.ipAddresses;
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Return true when the input value is valid
   * @param inputValue Input value to be checked
   */
  private _ipRangeValidator(inputValue: any) {
    try {
      // Catch and return false in case the input is not ip address format
      // to prevent exception thrown in the Netmask
      return this.netMask.contains(inputValue) &&
        this.netMask.broadcast !== inputValue &&
        this.netMask.base !== inputValue &&
        this.selectedNetwork.gateway !== inputValue;
    } catch (error) {
      return false;
    }
  }

  /**
   * Registers the form group controls
   */
  private _registerFormGroup(): void {
    // Create form controls
    this.fcCustomIpAddress = new FormControl('', [
      CoreValidators.required,
      CoreValidators.ipAddress,
      CoreValidators.custom(
        this._ipRangeValidator.bind(this),
        'ipRange'
      )
    ]);
    this.fcCustomIpAddress.valueChanges
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => this._notifyDataChanged());

    // Create form group and bind the form controls
    this.fgCustomIpAddress = new FormGroup({
      fcCustomIpAddress: this.fcCustomIpAddress
    });
  }

  /**
   * Resets the form group fields
   */
  private _resetFormGroup(): void {
    clearArrayRecord(this.ipAddressesInUsed);
    if (isNullOrEmpty(this.fgCustomIpAddress)) { return; }
    this.fgCustomIpAddress.reset();
    this.fcCustomIpAddress.reset();
  }

  /**
   * Sets the ip addresses to radio button options
   */
  private _setIpAddressItems(): void {
    this.ipAddressItems.push(new McsOption(ServerIpAllocationMode.Dhcp, 'DHCP'));
    this.ipAddressItems.push(
      new McsOption(ServerIpAllocationMode.Pool, 'Next in my static pool')
    );
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Sets the selected network if no network selected yet
   */
  private _setSelectedNetwork(): void {
    if (isNullOrEmpty(this.networks)) { return; }
    let hasSelectedNetwork = !isNullOrEmpty(this.selectedNetwork)
      && !isNullOrEmpty(this.networks.find((network) => network === this.selectedNetwork));
    if (hasSelectedNetwork) { return; }
    this.selectedNetwork = this.networks[0];
  }

  /**
   * Initializes the current view of the component based on its target NIC
   */
  private _initializeCurrentView(): void {
    let hasTargetNicToUpdate = !isNullOrEmpty(this.targetNic);
    if (!hasTargetNicToUpdate) { return; }

    this.inputManageType = this.targetNic.ipAllocationMode === ServerIpAllocationMode.Manual ?
      ServerInputManageType.Custom :
      ServerInputManageType.Buttons;
    if (this.targetNic.ipAllocationMode !== ServerIpAllocationMode.Manual) {
      this.selectedIpAddressMode = this.targetNic.ipAllocationMode;
    }
    this.fcCustomIpAddress.setValue(getSafeProperty(this.targetNic, (obj) => obj.ipAddresses[0]));
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Event that emits when an input has been changed
   */
  private _notifyDataChanged() {
    // Set model data based on management type
    switch (this.inputManageType) {
      case ServerInputManageType.Custom:
        this._networkOutput.network = this.selectedNetwork;
        this._networkOutput.customIpAddress = this.fcCustomIpAddress.value;
        this._networkOutput.ipAllocationMode = ServerIpAllocationMode.Manual;
        this._networkOutput.valid = this.fcCustomIpAddress.valid &&
          !isNullOrEmpty(this.selectedNetwork);
        break;

      case ServerInputManageType.Buttons:
      default:
        this._networkOutput.network = this.selectedNetwork;
        this._networkOutput.customIpAddress = null;
        this._networkOutput.ipAllocationMode = this.selectedIpAddressMode;
        this._networkOutput.valid = !isNullOrEmpty(this.selectedNetwork) &&
          !isNullOrEmpty(this.selectedIpAddressMode);
        break;
    }
    this._setNetworkHasChangedFlag();

    // Emit changes
    this.dataChange.emit(this._networkOutput);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Sets the network has changed flag based on target nic
   */
  private _setNetworkHasChangedFlag(): void {
    if (isNullOrEmpty(this.targetNic)) { return; }
    this._networkOutput.hasChanged = this._networkOutput.valid
      && (this._networkOutput.ipAllocationMode !== this.targetNic.ipAllocationMode
        || this._networkOutput.network.name !== this.targetNic.logicalNetworkName);

    let isCustomIpAddress = !this._networkOutput.hasChanged
      && this._networkOutput.ipAllocationMode === ServerIpAllocationMode.Manual
      && this._networkOutput.valid;
    if (isCustomIpAddress) {
      let ipAddressFound = this.targetNic.ipAddresses.find((ipAddress) =>
        this._networkOutput.customIpAddress === ipAddress);
      this._networkOutput.hasChanged = isNullOrEmpty(ipAddressFound);
    }
  }
}
