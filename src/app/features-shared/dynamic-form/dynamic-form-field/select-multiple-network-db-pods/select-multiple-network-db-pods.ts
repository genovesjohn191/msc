import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  FlatOption,
  GroupedOption
} from '../../dynamic-form-field-config.interface';

export class DynamicSelectMultipleNetworkDbPodsField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'select-multiple-network-db-pods';
  public template: DynamicFormFieldTemplate = 'select-multiple-network-db-pods';
  public options: GroupedOption[];

  public excludePods?: number[];
  public isMazAa: boolean;

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
    excludePods?: number [];
    isMazAa: boolean;
  }) {
    super(options);

    this.excludePods = options.excludePods || [];
    this.isMazAa = options.isMazAa || false;
  }
}
