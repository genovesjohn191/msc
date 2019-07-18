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
  finalize,
  takeUntil,
  shareReplay
} from 'rxjs/operators';
import {
  CoreValidators,
  McsDataStatusFactory,
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

export class ServerManageNetworkComponent
  implements OnInit, OnChanges, AfterViewInit, IMcsFormGroup, IMcsDataChange<ServerManageNetwork> {

  public netMask: any;
  public ipAddressesInUsed: McsResourceNetworkIpAddress[];
  public ipAddressItems: McsOption[];
  public inputManageType: InputManageType;
  public ipAddressesStatusFactory = new McsDataStatusFactory<McsResourceNetworkIpAddress[]>();

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

  @ViewChild(McsFormGroupDirective)
  private _formGroup: McsFormGroupDirective;

  private _networkOutput = new ServerManageNetwork();
  private _destroySubject = new Subject<void>();
  private _formControlsMap = new Map<InputManageType, () => void>();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: FormBuilder,
    private _translateService: TranslateService,
    private _apiService: McsApiService
  ) {
    this.inputManageType = InputManageType.Auto;
    this.ipAddressItems = new Array();
    this.ipAddressesInUsed = new Array();
    this.netMask = new Netmask(`${DEFAULT_GATEWAY}/${DEFAULT_NETMASK}`);
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
    return this._translateService.instant(
      'serverShared.manageNetwork.errors.ipAddressRangeError',
      { ip_range: `${this.netMask.first} - ${this.netMask.last}` }
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
    this._apiService.getResourceNetwork(this.resourceId, network.id).pipe(
      finalize(() => this.ipAddressesStatusFactory.setSuccessful(this.ipAddressesInUsed)),
      shareReplay(1)
    ).subscribe((response) => {
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
    // Register form control for Ip allocation mode
    this.fcIpAllocationMode = new FormControl(IpAllocationMode.Manual, [CoreValidators.required]);
    this.fcIpAllocationMode.valueChanges
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => this.notifyDataChange());

    // Register form control for custom ip address
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
    this.fcCustomIpAddress.setValue(getSafeProperty(this.targetNic, (obj) => obj.ipAddresses[0]));
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
