import {
  DynamicFormFieldData,
  DynamicFormFieldDataChangeEventParam
} from './dynamic-form-field-data.interface';
import { EventEmitter } from '@angular/core';

export interface DynamicFormField {
  id: string;

  label: string;

  visible: boolean;

  disabled: boolean;

  required: boolean;

  data: DynamicFormFieldData;

  dataChange: EventEmitter<DynamicFormFieldDataChangeEventParam>;

  onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void;

  clearFormField(reuseValue: boolean): void;

  setValue(value: any): void;
}
