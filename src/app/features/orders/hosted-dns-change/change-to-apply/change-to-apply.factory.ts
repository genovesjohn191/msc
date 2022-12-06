import { FormControl } from '@angular/forms';
import { DnsRecordType } from '@app/models';
import { CoreValidators } from '@app/core';
import { ActionType } from './change-to-apply';

const MIN_PRIORITY_VALUE = 1;
const MAX_PRIORITY_VALUE = 9999;
const MIN_TTL_VALUE = 300;
const MAX_TTL_VALUE = 86400;

export class ChangeToApplyFactory {

  /**
   * Create change form controls depending on the Action Type
   */
  public static createChangeFormControls(action: ActionType): { controlName: string, control: FormControl<any> }[] {
    let commonformControls: { controlName: string, control: FormControl<any> }[] = [
      { controlName: 'fcHostName', control: new FormControl<any>('', [CoreValidators.required]) },
      { controlName: 'fcTarget', control: new FormControl<any>('', [CoreValidators.required]) },
      {
        controlName: 'fcTtl', control: new FormControl<any>('', [
          CoreValidators.numeric,
          CoreValidators.min(MIN_TTL_VALUE),
          CoreValidators.max(MAX_TTL_VALUE)
        ])
      }
    ];

    let specificControls = action === ActionType.Add ?
      this._createAddSpeficFormControls() :
      this._createRemoveSpeficFormControls();

    return [...commonformControls, ...specificControls];
  }

  private static _createAddSpeficFormControls(): { controlName: string, control: FormControl<any> }[] {
    let formControls: { controlName: string, control: FormControl<any> }[] = [
      { controlName: 'fcRecordType', control: new FormControl<any>(DnsRecordType.A, [CoreValidators.required]) },
      {
        controlName: 'fcPriority', control: new FormControl<any>({value: '', disabled: true}, [
          CoreValidators.required,
          CoreValidators.numeric,
          CoreValidators.min(MIN_PRIORITY_VALUE),
          CoreValidators.max(MAX_PRIORITY_VALUE)
        ])
      }
    ];

    return formControls;
  }

  private static _createRemoveSpeficFormControls(): { controlName: string, control: FormControl<any> }[] {
    let formControls: { controlName: string, control: FormControl<any> }[] = [
      { controlName: 'fcRecordType', control: new FormControl<any>(DnsRecordType.A, []) },
      { controlName: 'fcTarget', control: new FormControl<any>('') },
      { controlName: 'fcTtl', control: new FormControl<any>('', [
        CoreValidators.numeric,
        CoreValidators.min(MIN_TTL_VALUE),
        CoreValidators.max(MAX_TTL_VALUE)
      ])},
      {
        controlName: 'fcPriority', control: new FormControl<any>({value: '', disabled: true}, [
          CoreValidators.numeric,
          CoreValidators.min(MIN_PRIORITY_VALUE),
          CoreValidators.max(MAX_PRIORITY_VALUE)
        ])
      }
    ];

    return formControls;
  }
}
