import { ValidatorFn } from '@angular/forms';
import { isNullOrEmpty } from '@app/utilities';
import {
  DynamicFormFieldConfig,
  DynamicFormFieldType,
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldTemplate,
  FlatOption,
  GroupedOption,
  DynamicFormControlValidator,
  DynamicFormControlSettings
} from './dynamic-form-field-config.interface';

export class DynamicFormFieldConfigBase implements DynamicFormFieldConfig {
  public type: DynamicFormFieldType;
  public template: DynamicFormFieldTemplate;
  public key: string;
  public label: string;
  public placeholder: string;
  public value?: any;
  public foreignKeyValue?: string;
  public initialValue?: any;
  public eventName?: DynamicFormFieldOnChangeEvent;
  public dependents?: string[];
  public options?: FlatOption[] | GroupedOption[];
  public hint?: string;
  public contextualHelp?: string;
  public order?: number;
  public validators?: DynamicFormControlValidator;
  public settings?: DynamicFormControlSettings;
  public prefix?: string;
  public suffix?: string;

  constructor(options: {
    key: string;
    label?: string;
    placeholder?: string;
    value?: any;
    foreignKeyValue?: string;
    options?: FlatOption[] | GroupedOption[];
    hint?: string;
    contextualHelp?: string;
    order?: number;
    eventName?: DynamicFormFieldOnChangeEvent;
    dependents?: string[];
    validators?: DynamicFormControlValidator;
    settings?: DynamicFormControlSettings;
    prefix?: string;
    suffix?: string;
  }) {
    this.key = options.key || '';
    this.label = options.label || '';
    this.placeholder = options.placeholder || '';
    this.value = options.value || '';
    this.initialValue = this.value;
    this.options = options.options || [];
    this.hint = isNullOrEmpty(options.hint) ? '' : options.hint.substring(0, 60);
    this.contextualHelp = options.contextualHelp || '';
    this.order = options.order === undefined ? 1 : options.order;
    this.eventName = options.eventName || '';
    this.dependents = options.dependents || [];
    this.validators = options.validators;
    this.settings = options.settings;
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

  public configureValidators(validators: ValidatorFn[]) { }
}
