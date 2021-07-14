import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  DynamicFormControlSettings
} from '../../dynamic-form-field-config.interface';

export class DynamicSelectAzureSubscriptionField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'select-azure-subscription';
  public template: DynamicFormFieldTemplate = 'select-azure-subscription';

  public useSubscriptionIdAsKey: boolean = false;
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
    useSubscriptionIdAsKey?: boolean;
    useServiceIdAsKey?: boolean;
  }) {
    super(options);

    this.useSubscriptionIdAsKey = options.useSubscriptionIdAsKey || false;
    this.useServiceIdAsKey = options.useServiceIdAsKey || false;
  }
}
