import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  DynamicFormControlSettings,
  GroupedOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectChipsValue } from '../dynamic-select-chips-field-component.base';

export class DynamicSelectChipsTerraformModuleField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'select-chips-terraform-module';
  public template: DynamicFormFieldTemplate = 'select-chips-terraform-module';
  public value?: DynamicSelectChipsValue[];

  public allowDuplicates: boolean = false;
  public options: GroupedOption[] = [];
  public useSlugIdAsKey: boolean = false;
  public allowCustomInput: boolean = false;
  public maxItems: number = 0; // less than 1 is considered infinite

  public constructor(options: {
    key: string;
    label: string;
    placeholder: string;
    value?: DynamicSelectChipsValue[];
    hint?: string;
    contextualHelp?: string;
    order?: number;
    eventName?: DynamicFormFieldOnChangeEvent;
    dependents?: string[];
    validators?: { required?: boolean; };
    settings?: DynamicFormControlSettings;
    allowCustomInput?: boolean;
    maxItems?: number;
    useSlugIdAsKey?: boolean;
  }) {
    super(options);

    this.allowCustomInput = options.allowCustomInput || false;
    this.maxItems = options.maxItems || 0;
    this.useSlugIdAsKey = options.useSlugIdAsKey || false;
  }
}
