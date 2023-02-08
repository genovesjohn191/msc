import { ValidatorFn } from '@angular/forms';
import { CoreValidators } from '@app/core';
import { McsObjectCrispElementServiceAttribute } from '@app/models';
import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  DynamicFormControlSettings
} from '../../dynamic-form-field-config.interface';

export class DynamicSelectVcloudInstanceField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'select-vcloud-instance';
  public template: DynamicFormFieldTemplate = 'select-vcloud-instance';
  public vdcAlreadyExistInSameVcloud: string = '';
  public vdcAlreadyExistInDifferentVcloud: string = '';
  public vcloudExistInServiceValidator?: (inputValue: any) => boolean = () => true;

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
    vdcAlreadyExistInSameVcloud?: string;
    vdcAlreadyExistInDifferentVcloud: string;
    crispElementServiceAttributes?: McsObjectCrispElementServiceAttribute[];
  }) {
    super(options);
    this.vdcAlreadyExistInSameVcloud = options.vdcAlreadyExistInSameVcloud;
    this.vdcAlreadyExistInDifferentVcloud = options.vdcAlreadyExistInDifferentVcloud;
  }

  public configureValidators(validators: ValidatorFn[]) {
    validators.push(CoreValidators.custom(
      this.vcloudExistInServiceValidator.bind(this),
      'vcloudExistInService'
    ));
  }
}
