import { DynamicFormFieldDataBase } from '../../dynamic-form-field-data.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate
} from '../../dynamic-form-field-data.interface';

export class DynamicInputTextField extends DynamicFormFieldDataBase {
  // Overrides
  public type: DynamicFormFieldType = 'textbox-input';
  public template: DynamicFormFieldTemplate = 'input-text';

  // Local properties
  public pattern: RegExp;

  public constructor(options: {
    key: string;
    label: string;
    placeholder: string;
    value?: string;
    hint?: string;
    order?: number;
    onChangeEvent?: DynamicFormFieldOnChangeEvent;
    dependents?: string[];
    validators?: { required?: boolean; minlength?: number; maxlength?: number; };
  }) {
    super(options);
  }
}
