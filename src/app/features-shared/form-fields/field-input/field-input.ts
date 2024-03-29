import { IFormField } from '../abstraction/form-field.interface';

export interface IFieldInput extends IFormField {
  minLength: number;
  maxLength: number;
}
