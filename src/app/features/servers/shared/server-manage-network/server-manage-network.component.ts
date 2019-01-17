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
  McsTextContentProvider,
  CoreValidators,
  McsDataStatusFactory
} from '@app/core';
import {
  replacePlaceholder,
  isNullOrEmpty,
  animateFactory,
  clearArrayRecord,
  getSafeProperty
} from '@app/utilities';
import {
  InputManageType,
  IpAllocationMode,
  McsServerNic,
  McsOption,
  McsResourceNetwork,
  McsResourceNetworkIpAddress,
} from '@app/models';
import { McsResourcesRepository } from '@app/services';
import { ServerManageNetwork } from './server-manage-network';

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
  ]
})

export class ServerManageNetworkComponent implements OnInit, OnChanges {
  public textContent: any;
  public netMask: any;
  public selectedIpAddressMode: IpAllocationMode;
  public ipAddressesInUsed: McsResourceNetworkIpAddress[];
  public ipAddressItems: McsOption[];
  public inputManageType: InputManageType;
  public ipAddressesStatusFactory = new McsDataStatusFactory<McsResourceNetworkIpAddress[]>();

  // Form variables
  public fgCustomIpAddress: FormGroup;
  public fcCustomIpAddress: FormControl;

  @Output()
  public dataChange = new EventEmitter<ServerManageNetwork>();

  @Output()
  public selectedNetworkChange = new EventEmitter<McsResourceNetwork>();

  @Input()
  public resourceId: string;

  @Input()
  public networks: McsResourceNetwork[];

  @Input()
  public targetNic: McsServerNic;

  @Input()
  public get selectedNetwork(): McsResourceNetwork { return this._selectedNetwork; }
  public set selectedNetwork(value: McsResourceNetwork) {
    if (this._selectedNetwork !== value) {
      this._selectedNetwork = value;
      this.selectedNetworkChange.emit(this._selectedNetwork);
      this._resetFormGroup();
      this._createNetmaskByNetwork(this._selectedNetwork);
      this._setInUsedIpAddresses(this._selectedNetwork);
      this._notifyDataChanged();
    }
  }
  private _selectedNetwork: McsResourceNetwork;

  private _networkOutput = new ServerManageNetwork();
  private _destroySubject = new Subject<void>();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider,
    private _resourcesRepository: McsResourcesRepository
  ) {
    this.inputManageType = InputManageType.Buttons;
    this.selectedIpAddressMode = IpAllocationMode.Dhcp;
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
    return InputManageType;
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
  public onChangeInputManageType(inputManageType: InputManageType) {
    this.inputManageType = inputManageType;
    this._notifyDataChanged();
  }

  /**
   * Event that emits when the radio button selection has been changed
   * @param inputValue Server allocation mode of the radio button
   */
  public onRadioButtonChanged(inputValue: IpAllocationMode) {
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
  private _createNetmaskByNetwork(network: McsResourceNetwork): void {
    if (isNullOrEmpty(network)) { return; }
    this.netMask = new Netmask(`${network.gateway}/${network.netmask}`);
  }

  /**
   * Sets the ip-addresses in used in the current network selected
   * @param network Network currently selected
   */
  private _setInUsedIpAddresses(network: McsResourceNetwork): void {
    if (isNullOrEmpty(network)) { return; }
    this.ipAddressesStatusFactory.setInProgress();
    this._resourcesRepository.getResourceNetwork(this.resourceId, network.id)
      .pipe(
        finalize(() => this.ipAddressesStatusFactory.setSuccessful(this.ipAddressesInUsed))
      )
      .subscribe((response) => {
        if (isNullOrEmpty(response)) { return; }
        this.ipAddressesInUsed = response.ipAddresses;
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
    this.ipAddressItems.push(new McsOption(IpAllocationMode.Dhcp, 'DHCP'));
    this.ipAddressItems.push(
      new McsOption(IpAllocationMode.Pool, 'Next in my static pool')
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

    this.inputManageType = this.targetNic.ipAllocationMode === IpAllocationMode.Manual ?
      InputManageType.Custom :
      InputManageType.Buttons;
    if (this.targetNic.ipAllocationMode !== IpAllocationMode.Manual) {
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
      case InputManageType.Custom:
        this._networkOutput.network = this.selectedNetwork;
        this._networkOutput.customIpAddress = this.fcCustomIpAddress.value;
        this._networkOutput.ipAllocationMode = IpAllocationMode.Manual;
        this._networkOutput.valid = this.fcCustomIpAddress.valid &&
          !isNullOrEmpty(this.selectedNetwork);
        break;

      case InputManageType.Buttons:
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
      && this._networkOutput.ipAllocationMode === IpAllocationMode.Manual
      && this._networkOutput.valid;
    if (isCustomIpAddress) {
      let ipAddressFound = this.targetNic.ipAddresses.find((ipAddress) =>
        this._networkOutput.customIpAddress === ipAddress);
      this._networkOutput.hasChanged = isNullOrEmpty(ipAddressFound);
    }
  }
}
