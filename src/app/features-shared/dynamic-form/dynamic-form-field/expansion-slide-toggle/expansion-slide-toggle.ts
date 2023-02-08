import { coerceBoolean } from '@app/utilities';
import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  DynamicFormControlSettings
} from '../../dynamic-form-field-config.interface';

export class DynamicExpansionSlideToggleField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'expansion-slide-toggle';
  public template: DynamicFormFieldTemplate = 'expansion-slide-toggle';
  public value: boolean = true;
  public expansionPanelTitle?: string = '';

  public constructor(options: {
    key: string;
    label: string;
    value: boolean;
    order?: number;
    eventName?: DynamicFormFieldOnChangeEvent;
    dependents?: string[];
    settings?: DynamicFormControlSettings;
    contextualHelp?: string;
    expansionPanelTitle?: string;
  }) {
    super(options);
    this.expansionPanelTitle = options.expansionPanelTitle;
    this.value = coerceBoolean(options.value);
  }
}
