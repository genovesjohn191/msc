import { DynamicFormFieldDataBase } from '../../dynamic-form-field-data.base';
import {
  DynamicFormFieldType,
  DynamicFormFieldTemplate, DynamicFormFieldOnChangeEvent
} from '../../dynamic-form-field-data.interface';

export class DynamicInputHiddenField extends DynamicFormFieldDataBase {
  // Overrides
  public type: DynamicFormFieldType = 'textbox-hidden';
  public template: DynamicFormFieldTemplate = 'input-hidden';

  public constructor(options: {
    key: string;
    value?: string;
    eventName?: DynamicFormFieldOnChangeEvent;
    dependents?: string[];
  }) {
    super(options);
  }
}
