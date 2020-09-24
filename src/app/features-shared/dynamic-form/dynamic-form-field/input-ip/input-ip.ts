import { CommonDefinition } from '@app/utilities';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType
} from '../../dynamic-form-field-data.interface';
import { DynamicInputTextField } from '../input-text/input-text';

export class DynamicInputIpField extends DynamicInputTextField {
  // Overrides
  public type: DynamicFormFieldType = 'textbox-ip';
  public pattern: RegExp = CommonDefinition.REGEX_IP_PATTERN;

  public constructor(options: {
    key: string;
    label: string;
    placeholder: string;
    value?: string;
    hint?: string;
    order?: number;
    eventName?: DynamicFormFieldOnChangeEvent;
    dependents?: string[];
    validators?: { required?: boolean; minlength?: number; maxlength?: number; };
  }) {
    super(options);
  }
}
