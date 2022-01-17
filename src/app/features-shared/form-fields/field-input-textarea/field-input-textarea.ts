import { IFormField } from '../abstraction/form-field.interface';

export interface IFieldInputTextarea extends IFormField {
  minLength: number;
  maxLength: number;
}
