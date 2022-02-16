import { ValidatorFn } from '@angular/forms';
import { CoreValidators } from '@app/core';
import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  DynamicFormControlSettings
} from '../../dynamic-form-field-config.interface';

export class DynamicInputPasswordField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'textbox-password';
  public template: DynamicFormFieldTemplate = 'input-password';

  public excludeQuestionMark?: boolean = false;
  public showByDefault: boolean = false;

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
    showByDefault?: boolean;
    validators?: { required?: boolean; minlength?: number; maxlength?: number; };
    settings?: DynamicFormControlSettings;
    excludeQuestionMark?: boolean;
  }) {
    super(options);

    this.excludeQuestionMark = options.excludeQuestionMark || false;
    this.showByDefault = options.showByDefault || false;
  }

  public configureValidators(validators: ValidatorFn[]) {
    if(this.excludeQuestionMark){
      validators.push(CoreValidators.containsQuestionMark);
    }
  }
}
