import { coerceBoolean } from '@app/utilities';
import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  DynamicFormControlSettings
} from '../../dynamic-form-field-config.interface';

export class DynamicSlideToggleField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'slide-toggle';
  public template: DynamicFormFieldTemplate = 'slide-toggle';
  public value: boolean = false;

  public constructor(options: {
    key: string;
    label: string;
    value?: boolean;
    order?: number;
    eventName?: DynamicFormFieldOnChangeEvent;
    dependents?: string[];
    settings?: DynamicFormControlSettings;
  }) {
    super(options);

    this.value = coerceBoolean(options.value);
  }
}
