import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  DynamicFormControlSettings
} from '../../dynamic-form-field-config.interface';

export class DynamicSelectResourceGroupField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'select-resource-group';
  public template: DynamicFormFieldTemplate = 'select-resource-group';

  public resourceType: string = '';
  public useAzureIdAsKey: boolean = false;
  public useNameAsKey: boolean = false;

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
    resourceType?: string;
    useAzureIdAsKey?: boolean;
    useNameAsKey?: boolean;
  }) {
    super(options);

    this.resourceType = options.resourceType;
    this.useAzureIdAsKey = options.useAzureIdAsKey || false;
    this.useNameAsKey = options.useNameAsKey || false;
  }
}
