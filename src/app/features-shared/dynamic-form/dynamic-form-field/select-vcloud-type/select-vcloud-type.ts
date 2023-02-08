import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  FlatOption,
  DynamicFormControlSettings
} from '../../dynamic-form-field-config.interface';

export class DynamicSelectVcloudTypeField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'select-vcloud-type';
  public template: DynamicFormFieldTemplate = 'select-vcloud-type';
  public options: FlatOption[];

  public constructor(options: {
    key: string;
    label: string;
    options: FlatOption[];
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
