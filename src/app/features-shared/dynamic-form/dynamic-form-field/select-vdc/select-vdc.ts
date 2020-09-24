import { DynamicFormFieldDataBase } from '../../dynamic-form-field-data.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  DynamicFormControlSettings
} from '../../dynamic-form-field-data.interface';

export class DynamicSelectVdcField extends DynamicFormFieldDataBase {
  // Overrides
  public type: DynamicFormFieldType = 'select-vdc';
  public template: DynamicFormFieldTemplate = 'select-vdc';
  public eventName: DynamicFormFieldOnChangeEvent = 'resource-change';

  public constructor(options: {
    key: string;
    label: string;
    placeholder?: string;
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
