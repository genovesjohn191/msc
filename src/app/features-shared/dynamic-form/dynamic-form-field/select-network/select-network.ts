import { DynamicFormFieldDataBase } from '../../dynamic-form-field-data.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate
} from '../../dynamic-form-field-data.interface';

export class DynamicSelectNetworkField extends DynamicFormFieldDataBase {
  // Overrides
  public type: DynamicFormFieldType = 'select-network';
  public template: DynamicFormFieldTemplate = 'select-network';

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
