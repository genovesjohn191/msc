import { ValidatorFn } from '@angular/forms';
import { CoreValidators } from '@app/core';
import {
  DynamicFormControlSettings,
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldTemplate,
  DynamicFormFieldType
} from '../../dynamic-form-field-config.interface';
import { DynamicInputTextField } from '../input-text/input-text';

export class DynamicInputShortCustomerNameField extends DynamicInputTextField {
  // Overrides
  public type: DynamicFormFieldType = 'textbox-short-customer-name';
  public template: DynamicFormFieldTemplate = 'input-short-customer-name';

  public constructor(options: {
    key: string;
    label: string;
    placeholder: string;
    value?: string;
    hint?: string;
    contextualHelp?: string;
    order?: number;
    eventName?: DynamicFormFieldOnChangeEvent;
    dependents?: string[];
    validators?: { required?: boolean; minlength?: number; maxlength?: number; };
    settings?: DynamicFormControlSettings;
  }) {
    super(options);
  }

  public configureValidators(validators: ValidatorFn[]) {
    validators.push(CoreValidators.shortCustomerName);
  }
}
