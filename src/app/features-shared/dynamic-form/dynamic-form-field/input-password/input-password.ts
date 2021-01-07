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
  }) {
    super(options);

    this.showByDefault = options.showByDefault || false;
  }
}