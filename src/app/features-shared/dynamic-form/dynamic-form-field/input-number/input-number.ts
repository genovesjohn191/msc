import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate, DynamicFormControlSettings
} from '../../dynamic-form-field-config.interface';

export class DynamicInputNumberField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'textbox-number';
  public template: DynamicFormFieldTemplate = 'input-number';

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
    validators?: { required?: boolean; min?: number; max?: number; };
    prefix?: string;
    suffix?: string;
    settings?: DynamicFormControlSettings;
  }) {
    super(options);
  }
}
