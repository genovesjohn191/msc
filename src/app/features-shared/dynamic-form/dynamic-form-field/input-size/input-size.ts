import { ValidatorFn } from '@angular/forms';
import { CoreValidators } from '@app/core';
import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate, DynamicFormControlSettings
} from '../../dynamic-form-field-config.interface';

export class DynamicInputSizeField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'textbox-size';
  public template: DynamicFormFieldTemplate = 'input-size';

  public constructor(options: {
    key: string;
    label: string;
    placeholder: string;
    value?: number;
    hint?: string;
    contextualHelp?: string;
    order?: number;
    onChangeEvent?: DynamicFormFieldOnChangeEvent;
    dependents?: string[];
    validators?: { required?: boolean; minSize?: number; maxSize?: number; };
    prefix?: string;
    suffix?: string;
    settings?: DynamicFormControlSettings;
  }) {
    super(options);
  }
}
