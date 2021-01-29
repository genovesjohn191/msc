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
    hideDedicated?: boolean;
    hideNonDedicated?: boolean;
    allowedHardwareType?: hardwareType[];
  }) {
    super(options);

    this.allowDuplicates = options.allowDuplicates || false;
    this.hideDedicated = options.hideDedicated || false;
    this.hideNonDedicated = options.hideNonDedicated || false;
    this.allowedHardwareType = options.allowedHardwareType || [];
  }
}
