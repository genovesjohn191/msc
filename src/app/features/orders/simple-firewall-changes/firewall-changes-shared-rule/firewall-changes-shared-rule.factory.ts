import { FormControl } from '@angular/forms';
import { DnsRecordType } from '@app/models';
import { CoreValidators } from '@app/core';
import { ActionType, ProtocolType, RuleAction } from './firewall-changes-shared-rule';

type customFormControl = {
  controlName: string,
  control: FormControl
}
export class FirewallChangesRuleFactory {

  /**
   * Create form controls depending on the Action Type
   */
  public static createFormControls(action: RuleAction): customFormControl[] {
    let formControls: customFormControl[] = [];
    if (action === RuleAction.Add) {
      formControls = [
      { controlName: 'fcSourceZoneInterface', control: new FormControl('', [CoreValidators.required]) },
      { controlName: 'fcSourceIpSubnet', control: new FormControl('', [CoreValidators.required,
                                                                       CoreValidators.ipAddressShortHandMask]) },
      { controlName: 'fcSourceZoneInterface', control: new FormControl('', [CoreValidators.required]) },
      { controlName: 'fcDestinationIpSubnet', control: new FormControl('', [CoreValidators.required,
                                                                            CoreValidators.ipAddressShortHandMask]) },
      { controlName: 'fcDestinationZoneInterface', control: new FormControl('', [CoreValidators.required]) },
      { controlName: 'fcDestinationPort', control: new FormControl('', [CoreValidators.required]) },
      { controlName: 'fcProtocol', control: new FormControl(ProtocolType.TCP, [CoreValidators.required]) }]
    } else if (action === RuleAction.Modify) {
      formControls = this._createModifySpecificFormControls();
    } else {
      formControls = this._createRemoveSpeficFormControls();
    }

    return formControls;
  }

  private static _createRemoveSpeficFormControls(): customFormControl[] {
    let formControls: { controlName: string, control: FormControl }[] = [
      { controlName: 'fcRulesToDelete', control: new FormControl('', [CoreValidators.required]) }
    ];

    return formControls;
  }

  private static _createModifySpecificFormControls(): customFormControl[] {
    let formControls: { controlName: string, control: FormControl }[] = [
      { controlName: 'fcExistingRule', control: new FormControl('', [CoreValidators.required]) },
      { controlName: 'fcNewRule', control: new FormControl('', [CoreValidators.required]) }
    ];

    return formControls;
  }
}
