import { McsObjectCrispElementServiceAttribute } from '@app/models';
import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  DynamicFormControlSettings
} from '../../dynamic-form-field-config.interface';

export class DynamicSelectVdcStorageField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'select-vdc-storage';
  public template: DynamicFormFieldTemplate = 'select-vdc-storage';

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
    crispElementServiceAttributes?: McsObjectCrispElementServiceAttribute[];
  }) {
    super(options);
  }
}
