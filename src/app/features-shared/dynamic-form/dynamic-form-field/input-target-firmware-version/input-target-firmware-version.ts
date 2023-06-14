import { ValidatorFn } from '@angular/forms';
import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  DynamicFormControlSettings
} from '../../dynamic-form-field-config.interface';
import { CoreValidators } from '@app/core';
import { DynamicInputTextField } from '../input-text/input-text';

export class DynamicInputTargetFirmwareVersionField extends DynamicInputTextField {
  // Overrides
  public type: DynamicFormFieldType = 'textbox-target-firmware-version';
  public template: DynamicFormFieldTemplate = 'input-target-firmware-version';

  public constructor(options: {
    key: string;
    label: string;
    placeholder: string;
    value?: string;
    hint?: string;
    contextualHelp?: string;
    onChangeEvent?: DynamicFormFieldOnChangeEvent;
    dependents?: string[];
    validators?: { required?: boolean };
    prefix?: string;
    suffix?: string;
    settings?: DynamicFormControlSettings;
    eventName?: DynamicFormFieldOnChangeEvent;
  }) {
    super(options);
  }

  public configureValidators(validators: ValidatorFn[]) {
    validators.push(CoreValidators.targetFirmwareVersion);
  }
}
