import { FormControl } from '@angular/forms';
import { CoreValidators } from '@app/core';
import { ProtocolType, RuleAction } from './firewall-changes-shared-rule';

type customFormControlWrapper = {
  controlName: string,
  control: FormControl<any>
}
export class FirewallChangesRuleHelper {

 /**
  * Create form controls depending on the Action Type
  */
  public static createFormControls(action: RuleAction): customFormControlWrapper[] {
    let formControls: customFormControlWrapper[] = [];
    if (action === RuleAction.Add) {
      formControls = [
      { controlName: 'fcSourceZoneInterface', control: new FormControl<any>('', [CoreValidators.required]) },
      { controlName: 'fcSourceIpSubnet', control: new FormControl<any>('', [CoreValidators.required,
                                                                       CoreValidators.ipAddressShortHandMask]) },
      { controlName: 'fcSourceZoneInterface', control: new FormControl<any>('', [CoreValidators.required]) },
      { controlName: 'fcDestinationIpSubnet', control: new FormControl<any>('', [CoreValidators.required,
                                                                            CoreValidators.ipAddressShortHandMask]) },
      { controlName: 'fcDestinationZoneInterface', control: new FormControl<any>('', [CoreValidators.required]) },
      { controlName: 'fcDestinationPort', control: new FormControl<any>('', [CoreValidators.required]) },
      { controlName: 'fcProtocol', control: new FormControl<any>(ProtocolType.TCP, [CoreValidators.required]) }]
    } else if (action === RuleAction.Modify) {
      formControls = this._createModifySpecificFormControls();
    } else {
      formControls = this._createRemoveSpeficFormControls();
    }
    return formControls;
  }
  private static _createRemoveSpeficFormControls(): customFormControlWrapper[] {
    let formControls: { controlName: string, control: FormControl<any> }[] = [
      { controlName: 'fcRulesToDelete', control: new FormControl<any>('', [CoreValidators.required]) }
    ];
    return formControls;
  }
  private static _createModifySpecificFormControls(): customFormControlWrapper[] {
    let formControls: { controlName: string, control: FormControl<any> }[] = [
      { controlName: 'fcExistingRule', control: new FormControl<any>('', [CoreValidators.required]) },
      { controlName: 'fcNewRule', control: new FormControl<any>('', [CoreValidators.required]) }
    ];
    return formControls;
  }
}
