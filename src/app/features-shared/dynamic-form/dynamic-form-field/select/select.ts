import { DynamicFormFieldDataBase } from '../../dynamic-form-field-data.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  FlatOption
} from '../../dynamic-form-field-data.interface';

export class DynamicSelectField extends DynamicFormFieldDataBase {
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
    onChangeEvent?: DynamicFormFieldOnChangeEvent;
    dependents?: string[];
    validators?: { required?: boolean; };
  }) {
    super(options);
  }
}
