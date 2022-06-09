import { ValidatorFn } from '@angular/forms';
import { CoreValidators } from '@app/core';
import { McsMultiJobFormConfig } from '@app/models';
import { CommonDefinition } from '@app/utilities';
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
  public pattern: RegExp = CommonDefinition.REGEX_NETWORK_NAME;

  public whitelist: Array<string> = [];
  public nameUniquenessValidator?: (inputValue: any) => boolean = () => true;
  public duplicateNameOnPanelsValidator?: (inputValue: any) => boolean = () => true;
  public networkItems?: McsMultiJobFormConfig[];

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
    networkItems?: McsMultiJobFormConfig[];
  }) {
    super(options);

    this.whitelist = options.whitelist || [];
    this.networkItems = options.networkItems;
  }

  public configureValidators(validators: ValidatorFn[]) {
    validators.push(CoreValidators.networkName);
    validators.push(CoreValidators.custom(
      this.nameUniquenessValidator.bind(this),
      'unique'
    ));
    validators.push(CoreValidators.custom(
      this.duplicateNameOnPanelsValidator.bind(this),
      'duplicateNameOnNetworkPanels'
    ));
  }
}
