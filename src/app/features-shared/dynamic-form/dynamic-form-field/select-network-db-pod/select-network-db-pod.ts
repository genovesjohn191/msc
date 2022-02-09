import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate
} from '../../dynamic-form-field-config.interface';

export class DynamicSelectNetworkDbPodField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'select-network-db-pod';
  public template: DynamicFormFieldTemplate = 'select-network-db-pod';

  public disableNonLaunch?: boolean;

  public constructor(options: {
    key: string;
    label: string;
    value?: string[];
    hint?: string;
    contextualHelp?: string;
    order?: number;
    eventName?: DynamicFormFieldOnChangeEvent;
    dependents?: string[];
    validators?: { required?: boolean; };
    disableNonLaunch?: boolean;
  }) {
    super(options);

    this.disableNonLaunch = options.disableNonLaunch || false;
  }
}
