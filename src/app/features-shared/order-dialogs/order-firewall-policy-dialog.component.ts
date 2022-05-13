import {
  Component,
  Inject,
  OnInit
} from '@angular/core';
import {
  FormControl,
  FormGroup
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { CoreValidators } from '@app/core';
import {
  McsFirewallPolicy,
  PolicyAction
} from '@app/models';
import { TranslateService } from '@ngx-translate/core';

export interface OrderFirewallPolicyEditDialogData {
  title: string;
  policy: McsFirewallPolicy;
  state: 'create' | 'edit' | 'delete';
}

@Component({
  selector: 'mcs-order-firewall-policy-dialog',
  templateUrl: './order-firewall-policy-dialog.component.html',
  styleUrls: ['./order-firewall-policy-dialog.scss']
})
export class OrderFirewallPolicyEditDialogComponent implements OnInit {
  public sourceInterfaceInput : string = '';
  public sourceAddressInput : string = '';
  public fgPolicy : FormGroup;
  public fcLabel : FormControl;
  public fcProtocol : FormControl;
  public fcSourceInterface : FormControl;
  public fcSourceAddress : FormControl;
  public fcSourcePort : FormControl;
  public fcDestinationInterface : FormControl;
  public fcDestinationAddress : FormControl;
  public fcDestinationPort : FormControl;
  public fcNatSourceIP : FormControl;
  public fcNatSourcePort : FormControl;
  public fcNatDestinationIP : FormControl;
  public fcNatDestinationPort : FormControl;

  public constructor(
    public dialogRef: MatDialogRef<OrderFirewallPolicyEditDialogComponent>,
    private _translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: OrderFirewallPolicyEditDialogData
  ){
    this._registerFormGroup();
  }

  public ngOnInit() {
    this._setPolicyValues();
  }

  public get formIsValid(): boolean {
    return this.fgPolicy.valid;
  }

  private _registerFormGroup(){
    this.fcLabel = new FormControl('');
    this.fcProtocol = new FormControl('', [CoreValidators.required]);
    this.fcSourceInterface = new FormControl('');
    this.fcSourceAddress = new FormControl('');
    this.fcSourcePort = new FormControl('');
    this.fcDestinationInterface = new FormControl('');
    this.fcDestinationAddress = new FormControl('');
    this.fcDestinationPort = new FormControl('');
    this.fcNatSourceIP = new FormControl('');
    this.fcNatSourcePort = new FormControl('');
    this.fcNatDestinationIP = new FormControl('');
    this.fcNatDestinationPort = new FormControl('');

    this.fgPolicy = new FormGroup({
      fcLabel: this.fcLabel,
      fcProtocol: this.fcProtocol,
      fcSourceInterface: this.fcSourceInterface,
      fcSourceAddress: this.fcSourceAddress,
      fcSourcePort: this.fcSourcePort,
      fcDestinationInterface: this.fcDestinationInterface,
      fcDestinationAddress: this.fcDestinationAddress,
      fcDestinationPort: this.fcDestinationPort,
      fcNatSourceIP: this.fcNatSourceIP,
      fcNatSourcePort: this.fcDestinationPort,
      fcNatDestinationIP: this.fcNatSourceIP,
      fcNatDestinationPort: this.fcDestinationPort,
    });
  }

  private _setPolicyValues(): void {
    this.fcLabel.setValue(this.data.policy.label);
    this.fcProtocol.setValue(this.data.policy.protocol);
    this.fcSourceInterface.setValue(this.data.policy.sourceInterfaces);
    this.fcSourceAddress.setValue(this.data.policy.sourceAddresses);
    this.fcSourcePort.setValue(this.data.policy.sourcePorts);
    this.fcDestinationInterface.setValue(this.data.policy.destinationInterfaces);
    this.fcDestinationAddress.setValue(this.data.policy.destinationAddresses);
    this.fcDestinationPort.setValue(this.data.policy.destinationPorts);
    this.fcNatSourceIP.setValue(this.data.policy.natSourceIpAddress);
    this.fcNatSourcePort.setValue(this.data.policy.natSourcePort);
    this.fcNatDestinationIP.setValue(this.data.policy.natDestinationIpAddress);
    this.fcNatDestinationPort.setValue(this.data.policy.natDestinationPort);
  }

  public reset(): void{
    this._setPolicyValues();
  }

  public onSave(): void {
    this.data.policy.label = this.fcLabel.value;
    this.data.policy.protocol = this.fcProtocol.value;
    this.data.policy.sourceInterfaces = this.fcSourceInterface.value;
    this.data.policy.sourceAddresses = this.fcSourceAddress.value;
    this.data.policy.sourcePorts = this.fcSourcePort.value;
    this.data.policy.destinationInterfaces = this.fcDestinationInterface.value;
    this.data.policy.destinationInterfaces = this.fcDestinationInterface.value;
    this.data.policy.destinationPorts = this.fcDestinationPort.value;
    this.data.policy.natSourceIpAddress = this.fcNatSourceIP.value;
    this.data.policy.natSourcePort = this.fcNatSourcePort.value;
    this.data.policy.natDestinationIpAddress = this.fcNatDestinationIP.value;
    this.data.policy.natDestinationPort = this.fcNatDestinationPort.value;
    if(this.data.state === 'edit' && this.data.policy.action !== PolicyAction.Remove) {
      this.data.policy.action = PolicyAction.Modify;
    }
  }

  public delete(): void {
    this.data.state = 'delete';
  }
}
