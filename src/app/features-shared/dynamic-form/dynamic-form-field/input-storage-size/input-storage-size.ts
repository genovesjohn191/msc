import {
  McsObjectCrispElementServiceAttribute,
  ProductType
} from '@app/models';
import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  DynamicFormControlSettings
} from '../../dynamic-form-field-config.interface';

export class DynamicInputStorageSizeField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'textbox-storage-size';
  public template: DynamicFormFieldTemplate = 'input-storage-size';

  public constructor(options: {
    key: string;
    label: string;
    placeholder: string;
    value?: number;
    hint?: string;
    contextualHelp?: string;
    order?: number;
    onChangeEvent?: DynamicFormFieldOnChangeEvent;
    eventName?: DynamicFormFieldOnChangeEvent;
    dependents?: string[];
    validators?: { required?: boolean; minSize?: number; maxSize?: number; };
    prefix?: string;
    suffix?: string;
    settings?: DynamicFormControlSettings;
    crispProductType?: ProductType;
    crispElementServiceAttributes?: McsObjectCrispElementServiceAttribute[];
  }) {
    super(options);
  }
}
