import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  FlatOption,
  DynamicFormControlSettings
} from '../../dynamic-form-field-config.interface';

export class DynamicSelectChipsField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'select-chips';
  public template: DynamicFormFieldTemplate = 'select-chips';
  public options: FlatOption[];
  public value?: string[];

  public allowCustomInput: boolean = false;
  public allowDuplicates: boolean = false;

  public constructor(options: {
    key: string;
    label: string;
    placeholder: string;
    options: FlatOption[];
    value?: string[];
    hint?: string;
    contextualHelp?: string;
    order?: number;
    eventName?: DynamicFormFieldOnChangeEvent;
    dependents?: string[];
    validators?: { required?: boolean; };
    settings?: DynamicFormControlSettings;
    allowCustomInput?: boolean;
    allowDuplicates?: boolean;
  }) {
    super(options);

    this.allowCustomInput = options.allowCustomInput || false;
    this.allowDuplicates = options.allowDuplicates || false;
  }
}
