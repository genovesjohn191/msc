import { DynamicFormFieldDataBase } from '../../dynamic-form-field-data.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  GroupedOption
} from '../../dynamic-form-field-data.interface';

export class DynamicSelectGroupField extends DynamicFormFieldDataBase {
  // Overrides
  public type: DynamicFormFieldType = 'select-group';
  public template: DynamicFormFieldTemplate = 'select-group';
  public options: GroupedOption[];

  public constructor(options: {
    key: string;
    label: string;
    placeholder?: string;
    options: GroupedOption[];
    value?: string;
    hint?: string;
    order?: number;
    eventName?: DynamicFormFieldOnChangeEvent;
    dependents?: string[];
    validators?: { required?: boolean; };
  }) {
    super(options);
  }
}
