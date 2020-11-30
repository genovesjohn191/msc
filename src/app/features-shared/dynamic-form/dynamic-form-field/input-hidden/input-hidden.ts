import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldType,
  DynamicFormFieldTemplate, DynamicFormFieldOnChangeEvent, DynamicFormControlSettings
} from '../../dynamic-form-field-config.interface';

export class DynamicInputHiddenField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'textbox-hidden';
  public template: DynamicFormFieldTemplate = 'input-hidden';
  public settings: DynamicFormControlSettings  = { preserve: true };

  public constructor(options: {
    key: string;
    value?: string;
    eventName?: DynamicFormFieldOnChangeEvent;
    dependents?: string[];
  }) {
    super(options);
  }
}
