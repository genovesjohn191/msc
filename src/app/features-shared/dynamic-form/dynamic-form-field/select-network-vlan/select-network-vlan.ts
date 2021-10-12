import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  DynamicFormControlSettings,
  FlatOption
} from '../../dynamic-form-field-config.interface';

export class DynamicSelectNetworkVlanField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'select-network-vlan';
  public template: DynamicFormFieldTemplate = 'select-network-vlan';
  public vlanVisibility?: boolean;
  public allowCustomInput: boolean = false;
  public options: FlatOption[] = [];

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
    vlanVisibility?: boolean;
    allowCustomInput?: boolean;
  }) {
    super(options);

    this.allowCustomInput = options.allowCustomInput || false;
    this.vlanVisibility = options.vlanVisibility || false;
  }
}
