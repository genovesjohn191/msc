import { DynamicFormFieldDataBase } from '../../dynamic-form-field-data.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  DynamicFormControlSettings
} from '../../dynamic-form-field-data.interface';

export class DynamicSelectStorageProfileField extends DynamicFormFieldDataBase {
  // Overrides
  public type: DynamicFormFieldType = 'select-storage-profile';
  public template: DynamicFormFieldTemplate = 'select-storage-profile';

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
