import { ValidatorFn } from '@angular/forms';
import { CoreValidators } from '@app/core';
import { ProductType } from '@app/models';
import { isNullOrUndefined } from '@app/utilities';
import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  DynamicFormControlSettings,
  FlatOption
} from '../../dynamic-form-field-config.interface';

export class DynamicSelectServiceField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'select-service';
  public template: DynamicFormFieldTemplate = 'select-service';
  public options: FlatOption[] = [];
  public productTypePattern: ProductType;
  public productType: ProductType;

  public constructor(options: {
    key: string;
    label: string;
    value?: string;
    hint?: string;
    contextualHelp?: string;
    order?: number;
    eventName?: DynamicFormFieldOnChangeEvent;
    dependents?: string[];
    validators?: { required?: boolean; productTypePattern?: ProductType; };
    settings?: DynamicFormControlSettings;
    allowCustomInput?: boolean;
    productType?: ProductType;
  }) {
    super(options);

    this.productTypePattern = options.validators.productTypePattern || undefined;
    this.productType = options.productType || undefined;
  }

  public configureValidators(validators: ValidatorFn[]) {
    if(!isNullOrUndefined(this.productTypePattern)) {
      switch(this.productTypePattern){
        case ProductType.FirewallDedicated:
          validators.push(CoreValidators.firewallServiceId);
          break;
      }
    }
  }
}
