import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  FlatOption,
  DynamicFormControlSettings
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectChipsValue } from '../dynamic-select-chips-field-component.base';
import { ServerFilterConfig } from '../shared-template/config/server-filter';

export class DynamicSelectChipsTenantField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'select-chips-tenant';
  public template: DynamicFormFieldTemplate = 'select-chips-tenant';
  public value?: DynamicSelectChipsValue[];

  public allowDuplicates: boolean = false;
  public options: FlatOption[] = [];
  public useTenantIdAsKey: boolean = false;
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
    useTenantIdAsKey?: boolean;
    dataFilter?: ServerFilterConfig;
  }) {
    super(options);

    this.allowCustomInput = options.allowCustomInput || false;
    this.maxItems = options.maxItems || 0;
    this.useTenantIdAsKey = options.useTenantIdAsKey || false;
  }
}
