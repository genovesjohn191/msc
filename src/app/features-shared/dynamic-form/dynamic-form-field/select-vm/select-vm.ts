import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  DynamicFormControlSettings
} from '../../dynamic-form-field-config.interface';
import { ServerFilterConfig } from '../shared-template/config/server-filter';

export class DynamicSelectVmField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'select-vm';
  public template: DynamicFormFieldTemplate = 'select-vm';

  public useServiceIdAsKey: boolean = false;
  public dataFilter: ServerFilterConfig = {};

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
    useServiceIdAsKey?: boolean;
    dataFilter?: ServerFilterConfig;
  }) {
    super(options);

    this.useServiceIdAsKey = options.useServiceIdAsKey || false;
    this.dataFilter = options.dataFilter || {};
  }
}

