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
    { key: RetentionOption.FourteenDays.toString(), value: retentionOptionText[RetentionOption.FourteenDays]},
    { key: RetentionOption.ThirtyDays.toString(), value: retentionOptionText[RetentionOption.ThirtyDays]},
    { key: RetentionOption.SixMonths.toString(), value: retentionOptionText[RetentionOption.SixMonths]},
    { key: RetentionOption.OneYear.toString(), value: retentionOptionText[RetentionOption.OneYear]},
    { key: RetentionOption.TwoYears.toString(), value: retentionOptionText[RetentionOption.TwoYears]},
    { key: RetentionOption.ThreeYears.toString(), value: retentionOptionText[RetentionOption.ThreeYears]},
    { key: RetentionOption.FourYears.toString(), value: retentionOptionText[RetentionOption.FourYears]},
    { key: RetentionOption.FiveYears.toString(), value: retentionOptionText[RetentionOption.FiveYears]},
    { key: RetentionOption.SixYears.toString(), value: retentionOptionText[RetentionOption.SixYears]},
    { key: RetentionOption.SevenYears.toString(), value: retentionOptionText[RetentionOption.SevenYears]}
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
