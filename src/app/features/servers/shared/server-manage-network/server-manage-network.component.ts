import {
  Component,
  OnInit,
  OnChanges,
  OnDestroy,
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
  takeUntil,
  startWith
} from 'rxjs/operators';
import {
  replacePlaceholder,
  isNullOrEmpty,
  animateFactory
} from '../../../../utilities';
import {
  McsTextContentProvider,
  McsOption,
  CoreValidators
} from '../../../../core';
import {
  ServerNetwork,
  ServerInputManageType,
  ServerIpAllocationMode,
  ServerManageNetwork
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
    animateFactory.fadeIn
  ],
  host: {
    'class': 'server-manage-network-wrapper block block-items-medium'
  }
})

export class ServerManageNetworkComponent implements OnInit, OnChanges, OnDestroy {

  public textContent: any;
  public netMask: any;
  public selectedIpAddress: ServerIpAllocationMode;
  public ipAddressItems: McsOption[];

  public inputManageType: ServerInputManageType;
  // Form variables
  public fgIpAddress: FormGroup;
  public fcIpdAdrress: FormControl;

  @Output()
  public dataChange = new EventEmitter<ServerManageNetwork>();

  @Output()
  public selectedNetworkChange = new EventEmitter<ServerNetwork>();

  @Input()
  public networks: ServerNetwork[];

  @Input()
  public customIpAddress: string;

  @Input()
  public get selectedNetwork(): ServerNetwork { return this._selectedNetwork; }
  public set selectedNetwork(value: ServerNetwork) {
    if (this._selectedNetwork !== value) {
      this._selectedNetwork = value;
      this.selectedNetworkChange.emit(this._selectedNetwork);
      this._createNetmaskByNetwork(this._selectedNetwork);
    }
  }
  private _selectedNetwork: ServerNetwork;

  private _destroySubject = new Subject<void>();
  private _networkOutput = new ServerManageNetwork();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider
  ) {
    this.inputManageType = ServerInputManageType.Buttons;
    this.ipAddressItems = new Array();
    this.netMask = new Netmask(`${DEFAULT_GATEWAY}/${DEFAULT_NETMASK}`);
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content
      .servers.shared.serverIpAddress;
    this._registerFormGroup();
    this._setIpAddressItems();
    this._setSelectedNetwork();
  }

  public ngOnChanges(changes: SimpleChanges) {
    let networksChange = changes['networks'];
    if (!isNullOrEmpty(networksChange)) {
      this._setSelectedNetwork();
    }
  }

  public ngOnDestroy() {
    this._destroySubject.next();
    this._destroySubject.complete();
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
    this.selectedIpAddress = inputValue;
    this._notifyDataChanged();
  }

  /**
   * Create the instance of the netmask based on the provided network
   * @param network Network to be considered
   */
  private _createNetmaskByNetwork(network: ServerNetwork): void {
    this._resetFormGroup();
    if (isNullOrEmpty(network)) { return; }
    this.netMask = new Netmask(`${network.gateway}/${network.netmask}`);
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
    this.fcIpdAdrress = new FormControl('', [
      CoreValidators.required,
      CoreValidators.ipAddress,
      CoreValidators.custom(
        this._ipRangeValidator.bind(this),
        'ipRange'
      )
    ]);

    // Notify data changed for every changes made in the status
    this.fcIpdAdrress.statusChanges
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(() => this._notifyDataChanged());

    // Create form group and bind the form controls
    this.fgIpAddress = new FormGroup({
      fcIpdAdrress: this.fcIpdAdrress
    });
  }

  /**
   * Resets the form group fields
   */
  private _resetFormGroup(): void {
    if (isNullOrEmpty(this.fgIpAddress)) { return; }
    this.fgIpAddress.reset();
    this.fcIpdAdrress.reset();
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
   * Event that emits when an input has been changed
   */
  private _notifyDataChanged() {
    // Set model data based on management type
    switch (this.inputManageType) {
      case ServerInputManageType.Custom:
        this._networkOutput.network = this.selectedNetwork;
        this._networkOutput.customIpAddress = this.customIpAddress ? this.customIpAddress : null;
        this._networkOutput.ipAllocationMode = ServerIpAllocationMode.Manual;
        this._networkOutput.valid = this.fcIpdAdrress.valid;
        break;

      case ServerInputManageType.Buttons:
      default:
        this._networkOutput.network = this.selectedNetwork;
        this._networkOutput.customIpAddress = null;
        this._networkOutput.ipAllocationMode = this.selectedIpAddress;
        this._networkOutput.valid = true;
        break;
    }
    // Emit changes
    this.dataChange.emit(this._networkOutput);
    this._changeDetectorRef.markForCheck();
  }
}
