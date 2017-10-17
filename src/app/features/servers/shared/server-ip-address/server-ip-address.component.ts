import {
  Component,
  Input,
  Output,
  OnInit,
  EventEmitter
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
  ServerIpAddress
} from '../../models';
import {
  refreshView,
  replacePlaceholder
} from '../../../../utilities';

// Require subnetting javscript class
const Netmask = require('netmask').Netmask;

@Component({
  selector: 'mcs-server-ip-address',
  styleUrls: ['./server-ip-address.component.scss'],
  templateUrl: './server-ip-address.component.html'
})

export class ServerIpAddressComponent implements OnInit {
  @Input()
  public subnetMask: string;

  @Input()
  public gateway: string;

  @Output()
  public ipAddressChanged: EventEmitter<ServerIpAddress>;

  public inputManageTypeEnum = ServerInputManageType;
  public inputManageType: ServerInputManageType;
  public ipAddressTextContent: any;

  public ipAddressValue: any;
  public ipAddressItems: McsListItem[];
  public customIpAdrress: string;

  // Form variables
  public formGroupIpAddress: FormGroup;
  public formControlRadiobuttons: FormControl;
  public formControlIpdAdrress: FormControl;

  private _netMaskInstance: any;

  public constructor(private _textProvider: McsTextContentProvider) {
    this.ipAddressItems = new Array();
    this.ipAddressChanged = new EventEmitter<ServerIpAddress>();
    this.inputManageType = ServerInputManageType.Buttons;
  }

  public ngOnInit() {
    this.ipAddressTextContent = this._textProvider.content
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

  private _initializeValues(): void {
    this.ipAddressValue = 'Dhcp';
    this._notifyIpAddress();
  }

  private _customIpAddressValidator(inputValue: any) {
    try {
      // Catch and return false in case the input is not ip address format
      // to prevent exception thrown in the Netmask
      return this._netMaskInstance.contains(inputValue);
    } catch (error) {
      return false;
    }
  }

  private _registerFormGroup(): void {
    // Create form controls
    this.formControlIpdAdrress = new FormControl('', [
      CoreValidators.required,
      CoreValidators.ipAddress,
      CoreValidators.custom(
        this._customIpAddressValidator.bind(this),
        replacePlaceholder(
          this.ipAddressTextContent.ipAddressRangeError,
          'ip_range',
          `${this._netMaskInstance.first} - ${this._netMaskInstance.last}`
        )
      )
    ]);
    this.formControlIpdAdrress.valueChanges
      .subscribe(this.onCustomIpAddressChanged.bind(this));

    // Create form group and bind the form controls
    this.formGroupIpAddress = new FormGroup({
      formControlIpdAdrress: this.formControlIpdAdrress
    });
  }

  private _createNetmaskInstance(): void {
    if (!this.gateway) { this.gateway = '192.168.0.1'; }
    if (!this.subnetMask) { this.subnetMask = '255.255.255.0'; }
    this._netMaskInstance = new Netmask(`${this.gateway}/${this.subnetMask}`);
  }

  private _setIpAddressItems(): void {
    this.ipAddressItems.push(new McsListItem('Dhcp', 'DHCP'));
    this.ipAddressItems.push(new McsListItem('Pool', 'Next in my static pool'));
  }

  private _notifyIpAddress() {
    let ipAddressData: ServerIpAddress = new ServerIpAddress();

    // Set model data based on management type
    switch (this.inputManageType) {
      case ServerInputManageType.Custom:
        ipAddressData.customIpAddress = this.customIpAdrress ? this.customIpAdrress : '';
        ipAddressData.ipAllocationMode = 'Manual';
        ipAddressData.valid = this.formControlIpdAdrress.valid;
        break;

      case ServerInputManageType.Buttons:
      default:
        ipAddressData.customIpAddress = this.customIpAdrress ? this.customIpAdrress : '';
        ipAddressData.ipAllocationMode = this.ipAddressValue;
        ipAddressData.valid = true;
        break;
    }

    refreshView(() => {
      this.ipAddressChanged.next(ipAddressData);
    }, CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
  }
}
