import {
  DynamicFormFieldData,
  DynamicFormFieldDataChange
} from './dynamic-form-field-data.interface';
import { EventEmitter } from '@angular/core';

export interface DynamicFormField {
  data: DynamicFormFieldData;

  dataChange: EventEmitter<DynamicFormFieldDataChange>;

  onFormDataChange(params: DynamicFormFieldDataChange): void;
}
