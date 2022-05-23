import { ValidatorFn } from '@angular/forms';
import { CoreValidators } from '@app/core';
import { CommonDefinition } from '@app/utilities';
import {
  DynamicFormControlSettings,
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldTemplate,
  DynamicFormFieldType
} from '../../dynamic-form-field-config.interface';
import { DynamicInputTextField } from '../input-text/input-text';

export class DynamicInputIpField extends DynamicInputTextField {
  // Overrides
  public type: DynamicFormFieldType = 'textbox-ip';
  public template: DynamicFormFieldTemplate = 'input-ip';
  public pattern: RegExp = CommonDefinition.REGEX_IP_PATTERN;

  public useNetworkRange?: boolean = false;
  public ipRangeValidator?: (inputValue: any) => boolean = () => true;
  public ipGatewayValidator?: (inputValue: any) => boolean = () => true;
  public subnetAutomationValidator?: (inputValue: any) => boolean = () => true;

  public constructor(options: {
    key: string;
    label: string;
    placeholder: string;
    value?: string;
    hint?: string;
    contextualHelp?: string;
    order?: number;
    eventName?: DynamicFormFieldOnChangeEvent;
    dependents?: string[];
    validators?: { required?: boolean; minlength?: number; maxlength?: number; };
    settings?: DynamicFormControlSettings;
    useNetworkRange?: boolean;
  }) {
    super(options);

    this.useNetworkRange = options.useNetworkRange || false;
  }

  public configureValidators(validators: ValidatorFn[]) {
    validators.push(CoreValidators.ipAddress);

    if (this.useNetworkRange) {
      validators.push(CoreValidators.custom(
        this.ipRangeValidator.bind(this),
        'ipRange'
      ));
      validators.push(CoreValidators.custom(
        this.ipGatewayValidator.bind(this),
        'ipIsGateway'
      ));
      validators.push(CoreValidators.custom(
        this.subnetAutomationValidator.bind(this),
        'subnetAutomationUnavailable'
      ));
    }
  }
}
