import { DynamicFormFieldDataBase } from '../../dynamic-form-field-data.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate
} from '../../dynamic-form-field-data.interface';

export class DynamicSelectOsField extends DynamicFormFieldDataBase {
  // Overrides
  public type: DynamicFormFieldType = 'select-os';
  public template: DynamicFormFieldTemplate = 'select-os';

  public constructor(options: {
    key: string;
    label: string;
    placeholder?: string;
    value?: string;
    hint?: string;
    order?: number;
    onChangeEvent?: DynamicFormFieldOnChangeEvent;
    dependents?: string[];
    validators?: { required?: boolean; };
  }) {
    super(options);
  }
}
