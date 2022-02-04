import { ValidatorFn } from '@angular/forms';
import { CoreValidators } from '@app/core';
import { CommonDefinition } from '@app/utilities';
import {
  DynamicFormControlSettings,
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType
} from '../../dynamic-form-field-config.interface';
import { DynamicInputTextField } from '../input-text/input-text';

export class DynamicInputAdomNameField extends DynamicInputTextField {
  // Overrides
  public type: DynamicFormFieldType = 'textbox-adom-name';
  public pattern: RegExp = CommonDefinition.REGEX_ADOM_NAME_PATTERN;

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
    settings?: DynamicFormControlSettings;
    validators?: { required?: boolean; minlength?: number; maxlength?: number; };
  }) {
    super(options);
  }

  public configureValidators(validators: ValidatorFn[]) {
    validators.push(CoreValidators.adomName);
  }
}