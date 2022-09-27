import { ProductType } from '@app/models';
import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  DynamicFormControlSettings,
  FlatOption
} from '../../dynamic-form-field-config.interface';

export class DynamicInputServerPanelField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'textbox-server-panel';
  public template: DynamicFormFieldTemplate = 'input-server-panel';
  public options: FlatOption[] = [];
  public description?: string = '';
  public multipleBladeFallback?: string = '';
  public noBladeFallback?: string = '';
  
  public constructor(options: {
    key: string;
    label: string;
    value?: string;
    hint?: string;
    contextualHelp?: string;
    description?: string;
    multipleBladeFallback?: string;
    noBladeFallback?: string;
    order?: number;
    eventName?: DynamicFormFieldOnChangeEvent;
    dependents?: string[];
    validators?: { required?: boolean; productTypePattern?: ProductType; };
    settings?: DynamicFormControlSettings;
    allowCustomInput?: boolean;
    productType?: ProductType;
  }) {
    super(options);

    this.description = options.description;
    this.multipleBladeFallback = options.multipleBladeFallback;
    this.noBladeFallback = options.noBladeFallback;
  }
}
