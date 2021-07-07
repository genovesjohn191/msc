import { ValidatorFn } from '@angular/forms';
import { CoreValidators } from '@app/core';
import {
  DynamicFormControlSettings,
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldTemplate,
  DynamicFormFieldType
} from '../../dynamic-form-field-config.interface';
import { DynamicInputTextField } from '../input-text/input-text';

export class DynamicInputNetworkDbNetworkNameField extends DynamicInputTextField {
  // Overrides
  public type: DynamicFormFieldType = 'textbox-network-db-network-name';
  public template: DynamicFormFieldTemplate = 'input-network-db-network-name';

  public whitelist: Array<string> = [];
  public nameUniquenessValidator?: (inputValue: any) => boolean = () => true;

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
    whitelist?: Array<string>;
  }) {
    super(options);

    this.whitelist = options.whitelist || [];
  }

  public configureValidators(validators: ValidatorFn[]) {
    validators.push(CoreValidators.custom(
      this.nameUniquenessValidator.bind(this),
      'unique'
    ));
  }
}
