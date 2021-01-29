import { hardwareType } from '@app/models';
import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  DynamicFormControlSettings
} from '../../dynamic-form-field-config.interface';

export class DynamicSelectVmField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'select-vm';
  public template: DynamicFormFieldTemplate = 'select-vm';

  public hideDedicated?: boolean = false;
  public hideNonDedicated?: boolean = false;
  public allowedHardwareType: hardwareType[] = [];

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
    hideDedicated?: boolean;
    hideNonDedicated?: boolean;
    allowedHardwareType?: hardwareType[];
  }) {
    super(options);

    this.hideDedicated = options.hideDedicated || false;
    this.hideNonDedicated = options.hideNonDedicated || false;
    this.allowedHardwareType = options.allowedHardwareType || [];
  }
}
