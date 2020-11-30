import {
  DynamicFormFieldConfig,
  DynamicFormFieldDataChangeEventParam
} from './dynamic-form-field-config.interface';
import { EventEmitter } from '@angular/core';

export interface DynamicFormFieldComponent {
  id: string;

  label: string;

  visible: boolean;

  disabled: boolean;

  required: boolean;

  config: DynamicFormFieldConfig;

  dataChange: EventEmitter<DynamicFormFieldDataChangeEventParam>;

  onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void;

  clearFormField(reuseValue: boolean): void;

  setInitialValue(value: any): void;
}
