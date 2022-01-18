import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate, DynamicFormControlSettings
} from '../../dynamic-form-field-config.interface';

export class DynamicInputSubscriptionIdField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'textbox-subscription-id';
  public template: DynamicFormFieldTemplate = 'input-subscription-id';

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
    validators?: { required?: boolean };
    prefix?: string;
    suffix?: string;
    settings?: DynamicFormControlSettings;
  }) {
    super(options);
  }
}
