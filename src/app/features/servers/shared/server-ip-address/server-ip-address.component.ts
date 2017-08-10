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
  McsList,
  McsListItem
} from '../../../../core';
import {
  ServerInputManageType,
  ServerIpAddress
} from '../../models';
import {
  refreshView,
  animateFactory
} from '../../../../utilities';

@Component({
  selector: 'mcs-server-ip-address',
  styles: [require('./server-ip-address.component.scss')],
  templateUrl: './server-ip-address.component.html',
  animations: [
    animateFactory({ duration: '500ms' })
  ]
})

export class ServerIpAddressComponent implements OnInit {
  @Output()
  public ipAddressChanged: EventEmitter<ServerIpAddress>;

  public inputManageTypeEnum = ServerInputManageType;
  public inputManageType: ServerInputManageType;

  public ipAddressValue: any;
  public ipAddressItems: McsListItem[];
  public customIpAdrress: string;

  // Form variables
  public formGroupIpAddress: FormGroup;
  public formControlRadiobuttons: FormControl;
  public formControlIpdAdrress: FormControl;

  public constructor(private _textProvider: McsTextContentProvider) {
    this.ipAddressItems = new Array();
    this.ipAddressChanged = new EventEmitter<ServerIpAddress>();
    this.inputManageType = ServerInputManageType.Buttons;
  }

  public ngOnInit() {
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
    this.ipAddressValue = 'dhcp';
    this._notifyIpAddress();
  }

  private _registerFormGroup(): void {
    // Create form controls
    this.formControlIpdAdrress = new FormControl('', [
      CoreValidators.required,
      CoreValidators.ipAddress
    ]);
    this.formControlIpdAdrress.valueChanges
      .subscribe(this.onCustomIpAddressChanged.bind(this));

    // Create form group and bind the form controls
    this.formGroupIpAddress = new FormGroup({
      formControlIpdAdrress: this.formControlIpdAdrress
    });
  }

  private _setIpAddressItems(): void {
    this.ipAddressItems.push(new McsListItem('dhcp', 'DHCP'));
    this.ipAddressItems.push(new McsListItem('next', 'Next in my static pool'));
  }

  private _notifyIpAddress() {
    let ipAddressData: ServerIpAddress = new ServerIpAddress();

    // Set model data based on management type
    switch (this.inputManageType) {
      case ServerInputManageType.Custom:
        ipAddressData.ipAddress = this.customIpAdrress;
        ipAddressData.valid = this.formControlIpdAdrress.valid;
        break;

      case ServerInputManageType.Buttons:
      default:
        ipAddressData.ipAddress = this.ipAddressValue;
        ipAddressData.valid = true;
        break;
    }

    refreshView(() => {
      this.ipAddressChanged.next(ipAddressData);
    }, CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
  }
}
