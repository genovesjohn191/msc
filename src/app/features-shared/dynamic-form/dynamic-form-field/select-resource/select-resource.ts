import { PlatformType, ProductType } from '@app/models';
import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  DynamicFormControlSettings
} from '../../dynamic-form-field-config.interface';

export class DynamicSelectResourceField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'select-resource';
  public template: DynamicFormFieldTemplate = 'select-resource';

  public useServiceIdAsKey: boolean = false;
  public includedPlatformTypes: PlatformType[] = [];
  public disableStretched: boolean = false;

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
    useServiceIdAsKey?: boolean;
    includedPlatformTypes?: PlatformType[];
    disableStretched?: boolean;
  }) {
    super(options);
    
    this.useServiceIdAsKey = options.useServiceIdAsKey || false;
    this.includedPlatformTypes = options.includedPlatformTypes || [];
    this.disableStretched = options.disableStretched || false;
  }
}
