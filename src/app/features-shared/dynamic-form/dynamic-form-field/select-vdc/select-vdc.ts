import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  DynamicFormControlSettings
} from '../../dynamic-form-field-config.interface';

export class DynamicSelectVdcField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'select-vdc';
  public template: DynamicFormFieldTemplate = 'select-vdc';

  public hideSelfManaged?: boolean = false;
  public hideManaged?: boolean = false;
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
    hideSelfManaged?: boolean;
    hideManaged?: boolean;
    useServiceIdAsKey?: boolean;
  }) {
    super(options);

    this.hideSelfManaged = options.hideSelfManaged || false;
    this.hideManaged = options.hideManaged || false;
    this.useServiceIdAsKey = options.useServiceIdAsKey || false;
  }
}
