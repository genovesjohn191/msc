import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  DynamicFormControlSettings
} from '../../dynamic-form-field-config.interface';

export class DynamicSelectPublicCloudResourceField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'select-public-cloud-resource';
  public template: DynamicFormFieldTemplate = 'select-public-cloud-resource';

  public resourceTypes: string[] = [];
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
    resourceTypes?: string[];
    useNameAsKey?: boolean;
    useAzureIdAsKey?: boolean;
  }) {
    super(options);

    this.resourceTypes = options.resourceTypes.map(type => type.toUpperCase());
    this.useNameAsKey = options.useNameAsKey || false;
    this.useAzureIdAsKey = options.useAzureIdAsKey || false;
  }
}
