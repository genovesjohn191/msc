import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  FlatOption,
  DynamicFormControlSettings
} from '../../dynamic-form-field-config.interface';

export class DynamicSelectLunsField extends DynamicFormFieldConfigBase {
    // Overrides
    public type: DynamicFormFieldType = 'select-luns';
    public template: DynamicFormFieldTemplate = 'select-luns';
  
    public constructor(options: {
      key: string;
      label: string;
      value?: string;
      hint?: string;
      contextualHelp?: string;
      order?: number;
      eventName?: DynamicFormFieldOnChangeEvent;
      dependents?: string[];
      validators?: { required?: boolean; };
      settings?: DynamicFormControlSettings;
    }) {
      super(options);
    }
}
