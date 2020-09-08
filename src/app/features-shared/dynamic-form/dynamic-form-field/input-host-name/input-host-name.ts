import { CommonDefinition } from '@app/utilities';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType
} from '../../dynamic-form-field-data.interface';
import { DynamicInputTextField } from '../input-text/input-text';

export class DynamicInputHostNameField extends DynamicInputTextField {
  // Overrides
  public type: DynamicFormFieldType = 'textbox-host-name';
  public pattern: RegExp = CommonDefinition.REGEX_SERVER_NAME_PATTERN;

  public constructor(options: {
    key: string;
    label: string;
    placeholder: string;
    value?: string;
    hint?: string;
    order?: number;
    onChangeEvent?: DynamicFormFieldOnChangeEvent;
    dependents?: string[];
    validators?: { required?: boolean; minlength?: number; maxlength?: number; };
  }) {
    super(options);
  }
}
