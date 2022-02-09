import { ProductType } from '@app/models';
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
  public pattern: RegExp = undefined;
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
    validators?: { required?: boolean; pattern: RegExp; };
    settings?: DynamicFormControlSettings;
    allowCustomInput?: boolean;
    productType?: ProductType;
  }) {
    super(options);

    this.pattern = options.validators.pattern || undefined;
    this.productType = options.productType || undefined;
  }
}
