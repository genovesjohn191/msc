import {
  DynamicFormFieldData,
  DynamicFormFieldType,
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldDataChange,
  DynamicFormFieldTemplate,
  FlatOption,
  GroupedOption
} from './dynamic-form-field-data.interface';

export class DynamicFormFieldDataBase implements DynamicFormFieldData, DynamicFormFieldDataChange {
  public type: DynamicFormFieldType;
  public template: DynamicFormFieldTemplate;
  public key: string;
  public label: string;
  public placeholder: string;
  public value?: any;
  public onChangeEvent?: DynamicFormFieldOnChangeEvent;
  public dependents?: string[];
  public options?: FlatOption[] | GroupedOption[];
  public hint?: string;
  public order?: number;
  public validators?: { required?: boolean; minlength?: number; maxlength?: number; min?: number; max?: number; };
  public prefix?: string;
  public suffix?: string;

  constructor(options: {
    key?: string;
    label?: string;
    placeholder?: string;
    value?: any;
    options?: FlatOption[] | GroupedOption[];
    hint?: string;
    order?: number;
    onChangeEvent?: DynamicFormFieldOnChangeEvent;
    dependents?: string[];
    validators?: { required?: boolean; minlength?: number; maxlength?: number; min?: number; max?: number; };
    prefix?: string;
    suffix?: string;
  }) {
    this.key = options.key || '';
    this.label = options.label || '';
    this.placeholder = options.placeholder || '';
    this.value = options.value || '';
    this.options = options.options || [];
    this.hint = options.hint || '';
    this.order = options.order === undefined ? 1 : options.order;
    this.onChangeEvent = options.onChangeEvent || '';
    this.dependents = options.dependents || [];
    this.validators = options.validators;
    this.prefix = options.prefix || '';
    this.suffix = options.suffix || '';

    // Ensure minlength is lessthan or equal than maxlength
    if (this.validators && this.validators.minlength && this.validators.maxlength) {
      if (this.validators.minlength > this.validators.maxlength) {
        this.validators.maxlength = this.validators.minlength;
      }
    }

    // Ensure min is lessthan or equal than max
    if (this.validators && this.validators.min && this.validators.max) {
      if (this.validators.min > this.validators.max) {
        this.validators.max = this.validators.min;
      }
    }
  }
}
