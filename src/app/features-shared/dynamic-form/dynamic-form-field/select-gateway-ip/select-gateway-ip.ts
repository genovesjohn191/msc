import { ValidatorFn } from '@angular/forms';
import { CoreValidators } from '@app/core';
import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  DynamicFormControlSettings,
  DynamicFormControlValidator,
  FlatOption
} from '../../dynamic-form-field-config.interface';

export class DynamicSelectGatewayIpField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'select-gateway-ip';
  public template: DynamicFormFieldTemplate = 'select-gateway-ip';
  public prefixValidators?: DynamicFormControlValidator;
  public options: FlatOption[] = [];
  public gatewayValidator?: (inputValue: any) => boolean = () => true;

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
    prefixValidators?: { required?: boolean; min?: number; max?: number; };
    settings?: DynamicFormControlSettings;
  }) {
    super(options);

    this.prefixValidators = options.prefixValidators;
  }

  public configureValidators(validators: ValidatorFn[]) {
    validators.push(CoreValidators.custom(
      this.gatewayValidator.bind(this),
      'privateIpAddress'
    ));
  }
}
