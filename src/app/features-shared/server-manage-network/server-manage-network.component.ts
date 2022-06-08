import {
  Component,
  OnInit,
  OnChanges,
  Input,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
  SimpleChanges,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import {
  takeUntil,
  shareReplay
} from 'rxjs/operators';
import {
  CoreValidators,
  IMcsFormGroup,
  IMcsDataChange
} from '@app/core';
import {
  isNullOrEmpty,
  animateFactory,
  clearArrayRecord,
  getSafeProperty,
  coerceBoolean,
  isNullOrUndefined
} from '@app/utilities';
import {
  InputManageType,
  IpAllocationMode,
  McsServerNic,
  McsOption,
  McsResourceNetwork,
  McsResourceNetworkIpAddress,
} from '@app/models';
import { McsApiService } from '@app/services';
import { McsFormGroupDirective } from '@app/shared';
import { ServerManageNetwork } from './server-manage-network';
import { McsResourceNetworkSubnet } from '@app/models/response/mcs-resource-network-subnet';

// Constants
const DEFAULT_GATEWAY = '192.168.0.1';
const DEFAULT_NETMASK = '255.255.255.0';
const DEFAULT_IP_RANGE_LAST = '3';

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

export class ServerManageNetworkComponent
  implements OnInit, OnChanges, AfterViewInit, IMcsFormGroup, IMcsDataChange<ServerManageNetwork> {

  public netMasks: any[];
  public ipAddressesInUsed: McsResourceNetworkIpAddress[];
  public ipAddressItems: McsOption[];
  public inputManageType: InputManageType;

  // Form variables
  public fgNetwork: FormGroup;
  public fcIpAllocationMode: FormControl;
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
  public selectedNetwork: McsResourceNetwork;

  @Input()
  public get disableDynamicIp(): boolean { return this._disableDynamicIp; }
  public set disableDynamicIp(value: boolean) {
    value = coerceBoolean(value);
    if (this._disableDynamicIp !== value) {
      this._disableDynamicIp = value;
      if (this._disableDynamicIp) {
        this.inputManageType = InputManageType.Custom;
      }
    }
  }
  private _disableDynamicIp: boolean;

  @Input()
  public get disableCustomEntry(): boolean { return this._disableCustomEntry; }
  public set disableCustomEntry(value: boolean) {
    value = coerceBoolean(value);
    if (this._disableCustomEntry !== value) {
      this._disableCustomEntry = value;
    }
  }
  private _disableCustomEntry: boolean = false;

  @Input()
  public get enableAutomationValidator(): boolean { return this._enableAutomationValidator; }
  public set enableAutomationValidator(value: boolean) { this._enableAutomationValidator = coerceBoolean(value); }
  private _enableAutomationValidator: boolean = false;

  @ViewChild(McsFormGroupDirective)
  private _formGroup: McsFormGroupDirective;

  private _networkOutput = new ServerManageNetwork();
  private _destroySubject = new Subject<void>();
  private _formControlsMap = new Map<InputManageType, () => void>();

  private _isIpValidationLoading: boolean = false;
  public get isIpValidationLoading(): boolean {
    return this._isIpValidationLoading;
  }

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: FormBuilder,
    private _translateService: TranslateService,
    private _apiService: McsApiService
  ) {
    this.inputManageType = InputManageType.Auto;
    this.ipAddressItems = new Array();
    this.ipAddressesInUsed = new Array();
    this.netMasks = new Array();
    this.netMasks.push(new Netmask(`${DEFAULT_GATEWAY}/${DEFAULT_NETMASK}`));
    this._createFormControlsMap();
  }

  public ngOnInit() {
    this._registerFormGroup();
    this._setIpAddressItems();
    this._setSelectedNetwork();
    this._initializeCurrentView();
    this.notifyDataChange();
  }

  public ngOnChanges(changes: SimpleChanges) {
    let networksChange = changes['networks'];
    if (!isNullOrEmpty(networksChange)) {
      this._setSelectedNetwork();
    }

    let resourceIdChange = changes['resourceId'];
    if (!isNullOrEmpty(resourceIdChange)) {
      this._setInUsedIpAddresses(this.selectedNetwork);
    }
  }

  public ngAfterViewInit() {
    Promise.resolve().then(() => {
      this._subscribeToFormTouchedState();
    });
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
    let ranges: Array<string> = new Array<string>();
    this.netMasks.forEach((netMask) => ranges.push(`${netMask.first} - ${netMask.last}`));
    let ipRange: string = ranges.join(`\r\n`);
    return this._translateService.instant(
      'serverShared.manageNetwork.errors.ipAddressRangeError',
      { ip_range: ipRange }
    );
  }

  /**
   * Returns the form group
   */
  public getFormGroup(): McsFormGroupDirective {
    return this._formGroup;
  }

  /**
   * Returns true when the form group is valid
   */
  public isValid(): boolean {
    return getSafeProperty(this.fgNetwork, (obj) => obj.valid);
  }

  /**
   * Event that emits when the input manage type has been changed
   */
  public onChangeInputManageType(inputManageType: InputManageType) {
    this.inputManageType = inputManageType;
    this._registerFormControlsByInputType();
    this.notifyDataChange();
  }

  /**
   * Event listener whenever resource network is changed
   */
  public onNetworkChanged(resourceNetwork: McsResourceNetwork) {
    this.selectedNetwork = resourceNetwork;
    this.selectedNetworkChange.emit(resourceNetwork);
    this._resetFormGroup();
    this._createNetmaskByNetwork(resourceNetwork);
    this._setInUsedIpAddresses(resourceNetwork);
    this.notifyDataChange();
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
   * Event that emits when an input has been changed
   */
  public notifyDataChange() {
    let noFormsRegistered = isNullOrEmpty(this.fcCustomIpAddress) || isNullOrEmpty(this.fcIpAllocationMode);
    if (noFormsRegistered) { return; }

    // Set model data based on management type
    switch (this.inputManageType) {
      case InputManageType.Custom:
        this._networkOutput.network = this.selectedNetwork;
        this._networkOutput.customIpAddress = this.fcCustomIpAddress.value;
        this._networkOutput.ipAllocationMode = IpAllocationMode.Manual;
        this._networkOutput.valid = this.fcCustomIpAddress.valid && !isNullOrEmpty(this.selectedNetwork);
        break;

      case InputManageType.Auto:
      default:
        this._networkOutput.network = this.selectedNetwork;
        this._networkOutput.customIpAddress = null;
        this._networkOutput.ipAllocationMode = this.fcIpAllocationMode.value;
        this._networkOutput.valid = this.fcIpAllocationMode.valid && !isNullOrEmpty(this.selectedNetwork);
        break;
    }
    this._setNetworkHasChangedFlag();

    // Emit changes
    this.dataChange.emit(this._networkOutput);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Create the instance of the netmask based on the provided network
   * @param network Network to be considered
   */
  private _createNetmaskByNetwork(network: McsResourceNetwork): void {
    if (isNullOrUndefined(network)) { return; }
    let netWorkSubnets: Array<McsResourceNetworkSubnet> = network.subnets;
    this.netMasks = new Array<any>();
    netWorkSubnets.forEach((subnet)=>{
      this.netMasks.push(new Netmask(`${subnet.gateway}/${subnet.netmask}`));
    });
    this.netMasks.forEach((netMask) => {
      if (!isNullOrEmpty(netMask.last) &&
        netMask.last === netMask.gateway) {
        netMask.last = netMask.last.replace(/.$/, DEFAULT_IP_RANGE_LAST);
      }
    });
  }

  /**
   * Sets the ip-addresses in used in the current network selected
   * @param network Network currently selected
   */
  private _setInUsedIpAddresses(network: McsResourceNetwork): void {
    let hasResourceNetwork = !isNullOrEmpty(this.resourceId) && !isNullOrEmpty(network);
    if (!hasResourceNetwork) { return; }
    this._isIpValidationLoading = true;
    this._apiService.getResourceNetwork(this.resourceId, network.id).pipe(
      shareReplay(1)
    ).subscribe((response) => {
      if (isNullOrEmpty(response)) { return; }
      this.ipAddressesInUsed = response.ipAddresses;
      this._addAutomationAvailableToNetMask(response.subnets);
      this._isIpValidationLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * Sets the automationAvailable value for each subnet mask
   * @param subnets subnet of the currently selected network
   */
  private _addAutomationAvailableToNetMask(subnets): void {
    subnets.forEach((subnet: McsResourceNetworkSubnet) => {
      let mask = new Netmask(`${subnet.gateway}/${subnet.netmask}`);
      let match = this.netMasks.find(netMask => {
        return (netMask.first === mask.first &&
                netMask.last === mask.last);
      });
      if(!isNullOrUndefined(match)) {
        match.automationAvailable = subnet?.automationAvailable;
      }
    })
  }

  /**
   * Return true when the input value is valid
   * @param inputValue Input value to be checked
   */
  private _ipRangeValidator(inputValue: any): boolean {
    try {
      // Catch and return false in case the input is not ip address format
      // to prevent exception thrown in the Netmask
      return this.netMasks.find((netMask) => {
        return (netMask.contains(inputValue) &&
          netMask.broadcast !== inputValue &&
          netMask.base !== inputValue);
      });
    }
    catch (error) {
      return false;
    }
  }

  /**
   * Return true when the automation is available for this subnet
   * @param inputValue Input value to be checked
   */
  private _subnetAutomationValidator(inputValue: any): boolean {
    try {
      let mask = this.netMasks.find((netMask) => {
        return (netMask.contains(inputValue) &&
          netMask.broadcast !== inputValue &&
          netMask.base !== inputValue);
      });
      return mask?.automationAvailable;
    }
    catch (error) {
      return false;
    }
  }

  /**
   * Checks if input is used as gateway and returns true when the input value is valid
   * @param inputValue Input value to be checked
   */
  private _ipGatewayValidator(inputValue: any): boolean {
    try {
      let selectedNedworkGateway = this.selectedNetwork.subnets.find((subnet) => subnet.gateway === inputValue);
      return (isNullOrUndefined(selectedNedworkGateway));
    }
    catch (error) {
      return false;
    }
  }

  /**
   * Registers the form group controls
   */
  private _registerFormGroup(): void {
    // Register form control for Ip allocation mode
    this.fcIpAllocationMode = new FormControl(IpAllocationMode.Manual, [CoreValidators.required]);
    this.fcIpAllocationMode.valueChanges
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => this.notifyDataChange());

    let validators = [
      CoreValidators.required,
      CoreValidators.ipAddress,
      CoreValidators.custom(
        this._ipRangeValidator.bind(this),
        'ipRange'
      ),
      CoreValidators.custom(
        this._ipGatewayValidator.bind(this),
        'ipIsGateway'
      )
    ];

    if (this._enableAutomationValidator) {
      validators.push(CoreValidators.custom(
        this._subnetAutomationValidator.bind(this),
        'subnetAutomationUnavailable'
      ));
    }

    // Register form control for custom ip address
    this.fcCustomIpAddress = new FormControl('', validators);
    this.fcCustomIpAddress.valueChanges
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => this.notifyDataChange());

    // Form group settings
    this.fgNetwork = this._formBuilder.group([]);
    this._registerFormControlsByInputType();
  }

  /**
   * Registers form controls based on the associated settings
   */
  private _registerFormControlsByInputType(): void {
    if (isNullOrUndefined(this.inputManageType)) { return; }

    let formControlsFunc = this._formControlsMap.get(this.inputManageType);
    if (isNullOrEmpty(formControlsFunc)) {
      throw new Error(`Invalid input manage type ${this.inputManageType}`);
    }
    formControlsFunc.call(this);
  }

  /**
   * Registers auto settings associated form controls
   */
  private _registerAutoFormControls(): void {
    this.fgNetwork.removeControl('fcCustomIpAddress');
    this.fgNetwork.setControl('fcIpAllocationMode', this.fcIpAllocationMode);
  }

  /**
   * Registers custom settings associated form controls
   */
  private _registerCustomFormControls(): void {
    this.fgNetwork.removeControl('fcIpAllocationMode');
    this.fgNetwork.setControl('fcCustomIpAddress', this.fcCustomIpAddress);
  }

  /**
   * Creates the form controls table map
   */
  private _createFormControlsMap(): void {
    this._formControlsMap.set(InputManageType.Auto,
      this._registerAutoFormControls.bind(this));

    this._formControlsMap.set(InputManageType.Custom,
      this._registerCustomFormControls.bind(this));
  }

  /**
   * Resets the form group fields
   */
  private _resetFormGroup(): void {
    clearArrayRecord(this.ipAddressesInUsed);
    if (!isNullOrEmpty(this.fgNetwork)) {
      this.fcCustomIpAddress.reset();
      this._initializeCurrentView();
    }
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
      InputManageType.Auto;
    if (this.targetNic.ipAllocationMode !== IpAllocationMode.Manual) {
      this.fcIpAllocationMode.setValue(this.targetNic.ipAllocationMode);
    }
    let currentIpAddress: string = getSafeProperty(this.targetNic, (obj) => obj.ipAddresses[0]);
    let ipAddress: string = (!isNullOrEmpty(currentIpAddress)) ?
                            currentIpAddress
                          : getSafeProperty(this.targetNic, (obj) => obj.vCloudIpAddress);
    this.fcCustomIpAddress.setValue(ipAddress);
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

  /**
   * Subscribe to touched state of the form group
   */
  private _subscribeToFormTouchedState(): void {
    this._formGroup.touchedStateChanges().pipe(
      takeUntil(this._destroySubject)
    ).subscribe(() => this._changeDetectorRef.markForCheck());
  }
}
