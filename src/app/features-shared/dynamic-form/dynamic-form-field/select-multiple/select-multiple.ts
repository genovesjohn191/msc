import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  FlatOption
} from '../../dynamic-form-field-config.interface';

export class DynamicSelectMultipleField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'select-multiple';
  public template: DynamicFormFieldTemplate = 'select-multiple';
  public options: FlatOption[];

  public constructor(options: {
    key: string;
    label: string;
    placeholder?: string;
    options: FlatOption[];
    value?: string[];
    hint?: string;
    order?: number;
    eventName?: DynamicFormFieldOnChangeEvent;
    dependents?: string[];
    validators?: { required?: boolean; };
  }) {
    super(options);
  }
}
