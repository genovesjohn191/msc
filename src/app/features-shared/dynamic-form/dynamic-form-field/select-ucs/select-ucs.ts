import { ValidatorFn } from '@angular/forms';
import { CoreValidators } from '@app/core';
import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  DynamicFormControlSettings
} from '../../dynamic-form-field-config.interface';

export class DynamicSelectUcsField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'select-ucs';
  public template: DynamicFormFieldTemplate = 'select-ucs';
  public ucsValidator?: (inputValue: any) => boolean = () => true;

  public constructor(options: {
    key: string;
    label: string;
    value?: string;
    hint?: string;
    contextualHelp?: string;
    order?: number;
    eventName?: DynamicFormFieldOnChangeEvent;
    dependents?: string[];
    validators?: { required?: boolean; };
    settings?: DynamicFormControlSettings;
  }) {
    super(options);
  }
  
  public configureValidators(validators: ValidatorFn[]) {
    validators.push(CoreValidators.custom(
      this.ucsValidator.bind(this),
      'ucsDomainGroup'
    ));
  }
}