import { DynamicFormFieldDataBase } from '../../dynamic-form-field-data.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate
} from '../../dynamic-form-field-data.interface';

export class DynamicSelectVdcField extends DynamicFormFieldDataBase {
  // Overrides
  public type: DynamicFormFieldType = 'select-vdc';
  public template: DynamicFormFieldTemplate = 'select-vdc';
  public onChangeEvent: DynamicFormFieldOnChangeEvent = 'resource-change';

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
