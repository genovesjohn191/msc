import { McsObjectCrispElementService, McsObjectCrispElementServiceAttribute } from '@app/models';
import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  DynamicFormControlSettings
} from '../../dynamic-form-field-config.interface';

export class DynamicTableStorageProfileField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'table-storage-profile';
  public template: DynamicFormFieldTemplate = 'table-storage-profile';

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
    productId?: string;
    associatedServices?: McsObjectCrispElementService[];
    crispElementServiceAttributes?: McsObjectCrispElementServiceAttribute[];
  }) {
    super(options);
  }
}
