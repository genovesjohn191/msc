import { RetentionOption, retentionOptionText } from '@app/models/enumerations/retention-option.enum';
import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  FlatOption,
  DynamicFormControlSettings
} from '../../dynamic-form-field-config.interface';

export class DynamicSelectRetentionPeriodField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'select-retention-period';
  public template: DynamicFormFieldTemplate = 'select-retention-period';
  public options: FlatOption[] = [
    { key: retentionOptionText[RetentionOption.FourteenDays].replace(' ','-').toUpperCase(),
      value: retentionOptionText[RetentionOption.FourteenDays]},
    { key: retentionOptionText[RetentionOption.ThirtyDays].replace(' ','-').toUpperCase(),
      value: retentionOptionText[RetentionOption.ThirtyDays]},
    { key: retentionOptionText[RetentionOption.SixMonths].replace(' ','-').toUpperCase(),
      value: retentionOptionText[RetentionOption.SixMonths]},
    { key: retentionOptionText[RetentionOption.OneYear].replace(' ','-').toUpperCase(),
      value: retentionOptionText[RetentionOption.OneYear]},
    { key: retentionOptionText[RetentionOption.TwoYears].replace(' ','-').toUpperCase(),
      value: retentionOptionText[RetentionOption.TwoYears]},
    { key: retentionOptionText[RetentionOption.ThreeYears].replace(' ','-').toUpperCase(),
      value: retentionOptionText[RetentionOption.ThreeYears]},
    { key: retentionOptionText[RetentionOption.FourteenDays].replace(' ','-').toUpperCase(),
      value: retentionOptionText[RetentionOption.FourYears]},
    { key: retentionOptionText[RetentionOption.FiveYears].replace(' ','-').toUpperCase(),
      value: retentionOptionText[RetentionOption.FiveYears]},
    { key: retentionOptionText[RetentionOption.SixYears].replace(' ','-').toUpperCase(),
      value: retentionOptionText[RetentionOption.SixYears]},
    { key: retentionOptionText[RetentionOption.SevenYears].replace(' ','-').toUpperCase(),
      value: retentionOptionText[RetentionOption.SevenYears]}
  ];

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
  }) {
    super(options);
  }
}
