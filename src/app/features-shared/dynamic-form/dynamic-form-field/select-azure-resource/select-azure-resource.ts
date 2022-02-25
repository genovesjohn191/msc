import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  DynamicFormControlSettings
} from '../../dynamic-form-field-config.interface';

export class DynamicSelectAzureResourceField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'select-azure-resource';
  public template: DynamicFormFieldTemplate = 'select-azure-resource';

  public resourceType: string = '';
  public useNameAsKey: boolean = false;
  public useAzureIdAsKey: boolean = false;

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
    useNameAsKey?: boolean;
    useAzureIdAsKey?: boolean;
  }) {
    super(options);

    this.resourceType = options.resourceType;
    this.useNameAsKey = options.useNameAsKey || false;
    this.useAzureIdAsKey = options.useAzureIdAsKey || false;
  }
}
