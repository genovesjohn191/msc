import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  FlatOption,
  DynamicFormControlSettings
} from '../../dynamic-form-field-config.interface';

export class DynamicSelectField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'select';
  public template: DynamicFormFieldTemplate = 'select';
  public options: FlatOption[];

  public constructor(options: {
    key: string;
    label: string;
    placeholder?: string;
    options: FlatOption[];
    value?: string;
    hint?: string;
    order?: number;
    eventName?: DynamicFormFieldOnChangeEvent;
    dependents?: string[];
    validators?: { required?: boolean; };
    settings?: DynamicFormControlSettings;
  }) {
    super(options);
  }
}
