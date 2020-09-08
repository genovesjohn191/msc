import { DynamicFormFieldDataBase } from '../../dynamic-form-field-data.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate
} from '../../dynamic-form-field-data.interface';

export class DynamicInputNumberField extends DynamicFormFieldDataBase {
  // Overrides
  public type: DynamicFormFieldType = 'textbox-number';
  public template: DynamicFormFieldTemplate = 'input-number';

  public constructor(options: {
    key: string;
    label: string;
    placeholder: string;
    value?: string;
    hint?: string;
    order?: number;
    onChangeEvent?: DynamicFormFieldOnChangeEvent;
    dependents?: string[];
    validators?: { required?: boolean; min?: number; max?: number; };
    prefix?: string;
    suffix?: string;
  }) {
    super(options);
  }
}
