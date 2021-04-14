import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  FlatOption,
  DynamicFormControlSettings
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectChipsValue } from '../dynamic-select-chips-field-component.base';

export class DynamicSelectChipsCompanyField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'select-chips-company';
  public template: DynamicFormFieldTemplate = 'select-chips-company';
  public eventName: DynamicFormFieldOnChangeEvent = 'company-change';
  public value?: DynamicSelectChipsValue[];

  public allowDuplicates: boolean = false;
  public options: FlatOption[] = [];
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
  }) {
    super(options);

    this.allowCustomInput = options.allowCustomInput || false;
    this.maxItems = options.maxItems || 0;
  }
}
