import {
  DynamicFormFieldData,
  DynamicFormFieldDataChangeEventParam
} from './dynamic-form-field-data.interface';
import { EventEmitter } from '@angular/core';

export interface DynamicFormField {
  data: DynamicFormFieldData;

  dataChange: EventEmitter<DynamicFormFieldDataChangeEventParam>;

  onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void;

  clearFormFields(reuseValue: boolean): void;

  setValue(value: any): void;
}
