import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate
} from '../../dynamic-form-field-config.interface';

export class DynamicInputRandomField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'textbox-random';
  public template: DynamicFormFieldTemplate = 'input-random';

  // Local properties
  public readonly: boolean;
  public anyCharCount: number = 0;
  public alphaCharCount: number;
  public numericCharCount: number;
  public specialCharCount: number;

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
    readonly: boolean;
    alphaCharCount: number,
    numericCharCount: number,
    specialCharCount: number,
  }) {
    super(options);

    this.readonly = options.readonly;

    this.alphaCharCount = (options.alphaCharCount < 0 ) ? 0 : Math.ceil(options.alphaCharCount);
    this.numericCharCount = (options.numericCharCount < 0 ) ? 0 : Math.ceil(options.numericCharCount);
    this.specialCharCount = (options.specialCharCount < 0 ) ? 0 : Math.ceil(options.specialCharCount);
    let total = this.alphaCharCount + this.numericCharCount + this.specialCharCount;

    // Fill remaining characters for random generation
    // if minimum length is not met by initial configuration
    if (options.validators && total < options.validators.minlength) {
      this.anyCharCount = options.validators.minlength - total;
    }
  }
}
