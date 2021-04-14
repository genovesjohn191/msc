import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  DynamicFormControlSettings
} from '../../dynamic-form-field-config.interface';

export class DynamicSelectBatField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'select-bat';
  public template: DynamicFormFieldTemplate = 'select-bat';

  public useServiceIdAsKey: boolean = false;

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
    useServiceIdAsKey?: boolean;
  }) {
    super(options);

    this.useServiceIdAsKey = options.useServiceIdAsKey || false;
  }
}

