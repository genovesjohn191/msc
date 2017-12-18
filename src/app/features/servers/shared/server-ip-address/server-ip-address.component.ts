import {
  Component,
  Input,
  Output,
  OnInit,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  FormGroup,
  FormControl
} from '@angular/forms';
import {
  McsTextContentProvider,
  CoreDefinition,
  CoreValidators,
  McsListItem
} from '../../../../core';
import {
  ServerInputManageType,
  ServerIpAddress,
  ServerIpAllocationMode
} from '../../models';
import {
  refreshView,
  replacePlaceholder,
  isNullOrEmpty
} from '../../../../utilities';

// Require subnetting javscript class
const Netmask = require('netmask').Netmask;

@Component({
  selector: 'mcs-server-ip-address',
  styleUrls: ['./server-ip-address.component.scss'],
  templateUrl: './server-ip-address.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ServerIpAddressComponent implements OnInit {
  @Input()
  public ipAllocationMode: ServerIpAllocationMode;

  @Input()
  public ipAddress: string;

  @Input()
  public subnetMask: string;

  @Input()
  public gateway: string;

  @Output()
  public ipAddressChanged: EventEmitter<ServerIpAddress>;

  public inputManageTypeEnum = ServerInputManageType;
  public inputManageType: ServerInputManageType;
  public textContent: any;

  public ipAddressValue: any;
  public ipAddressItems: McsListItem[];
  public customIpAdrress: string;

  // Form variables
  public formGroupIpAddress: FormGroup;
  public formControlRadiobuttons: FormControl;
  public fcIpdAdrress: FormControl;

  private _netMaskInstance: any;

  public constructor(
    private _textProvider: McsTextContentProvider,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.ipAllocationMode = ServerIpAllocationMode.Dhcp;
    this.ipAddressItems = new Array();
    this.ipAddressChanged = new EventEmitter<ServerIpAddress>();
    this.inputManageType = ServerInputManageType.Buttons;
  }

  public ngOnInit() {
    this.textContent = this._textProvider.content
      .servers.shared.serverIpAddress;
    this._createNetmaskInstance();
    this._registerFormGroup();
    this._setIpAddressItems();
    this._initializeValues();
  }

  public isControlValid(control: FormControl): boolean {
    return control ? !(!control.valid && control.touched) : false;
  }

  public onRadioButtonChanged(inputValue: any) {
    this.ipAddressValue = inputValue;
    this._notifyIpAddress();
  }

  public onCustomIpAddressChanged(inputValue: any) {
    this.customIpAdrress = inputValue;
    this._notifyIpAddress();
  }

  public onChangeInputManageType(inputManageType: ServerInputManageType) {
    refreshView(() => {
      this.inputManageType = inputManageType;
      this._notifyIpAddress();
    });
  }

  public get ipRangeError(): string {
    return replacePlaceholder(
      this.textContent.errors.ipAddressRangeError,
      'ip_range',
      `${this._netMaskInstance.first} - ${this._netMaskInstance.last}`
    );
  }

  private _initializeValues(): void {
    if (this.ipAllocationMode === ServerIpAllocationMode.Manual) {
      this.inputManageType = ServerInputManageType.Custom;
    } else {
      this.inputManageType = ServerInputManageType.Buttons;
      this.ipAddressValue = this.ipAllocationMode;
    }

    this._notifyIpAddress();
  }

  private _ipRangeValidator(inputValue: any) {
    try {
      // Catch and return false in case the input is not ip address format
      // to prevent exception thrown in the Netmask
      return this._netMaskInstance.contains(inputValue) &&
        this._netMaskInstance.broadcast !== inputValue &&
        this._netMaskInstance.base !== inputValue;
    } catch (error) {
      return false;
    }
  }

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

    this.fcIpdAdrress.valueChanges
      .subscribe(this.onCustomIpAddressChanged.bind(this));

    if (!isNullOrEmpty(this.ipAddress)) {
      this.fcIpdAdrress.setValue(this.ipAddress);
    }

    // Create form group and bind the form controls
    this.formGroupIpAddress = new FormGroup({
      formControlIpdAdrress: this.fcIpdAdrress
    });
  }

  private _createNetmaskInstance(): void {
    if (!this.gateway) { this.gateway = '192.168.0.1'; }
    if (!this.subnetMask) { this.subnetMask = '255.255.255.0'; }
    this._netMaskInstance = new Netmask(`${this.gateway}/${this.subnetMask}`);
  }

  private _setIpAddressItems(): void {
    this.ipAddressItems.push(new McsListItem(ServerIpAllocationMode.Dhcp, 'DHCP'));
    this.ipAddressItems.push(
      new McsListItem(ServerIpAllocationMode.Pool, 'Next in my static pool')
    );
  }

  private _notifyIpAddress() {
    let ipAddressData: ServerIpAddress = new ServerIpAddress();

    // Set model data based on management type
    switch (this.inputManageType) {
      case ServerInputManageType.Custom:
        ipAddressData.customIpAddress = this.customIpAdrress ? this.customIpAdrress : null;
        ipAddressData.ipAllocationMode = ServerIpAllocationMode.Manual;
        ipAddressData.valid = this.fcIpdAdrress.valid;
        break;

      case ServerInputManageType.Buttons:
      default:
        ipAddressData.customIpAddress = this.customIpAdrress ? this.customIpAdrress : null;
        ipAddressData.ipAllocationMode = this.ipAddressValue;
        ipAddressData.valid = true;
        break;
    }

    refreshView(() => {
      this.ipAddressChanged.next(ipAddressData);
      this._changeDetectorRef.markForCheck();
    }, CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
  }
}
