import { hardwareType } from '@app/models';
import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  FlatOption,
  DynamicFormControlSettings
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectChipsValue } from '../dynamic-select-chips-field-component.base';

export class DynamicSelectChipsVmField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'select-chips-vm';
  public template: DynamicFormFieldTemplate = 'select-chips-vm';
  public value?: DynamicSelectChipsValue[];

  public allowDuplicates: boolean = false;
  public options: FlatOption[] = [];
  public hideDedicated?: boolean = false;
  public hideNonDedicated?: boolean = false;
  public useServiceIdAsKey: boolean = false;
  public allowCustomInput: boolean = false;
  public maxItems: number = 0; // less than 1 is considered infinite
  public allowedHardwareType: hardwareType[] = [];


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
    allowDuplicates?: boolean;
    allowCustomInput?: boolean;
    maxItems?: number;
    hideDedicated?: boolean;
    hideNonDedicated?: boolean;
    useServiceIdAsKey?: boolean;
    allowedHardwareType?: hardwareType[];
  }) {
    super(options);

    this.allowDuplicates = options.allowDuplicates || false;
    this.allowCustomInput = options.allowCustomInput || false;
    this.maxItems = options.maxItems || 0;
    this.hideDedicated = options.hideDedicated || false;
    this.hideNonDedicated = options.hideNonDedicated || false;
    this.useServiceIdAsKey = options.useServiceIdAsKey || false;
    this.allowedHardwareType = options.allowedHardwareType || [];
  }
}
