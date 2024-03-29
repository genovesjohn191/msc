import { IFormField } from '../abstraction/form-field.interface';

export interface IFieldInputUrl extends IFormField {
  minLength: number;
  maxLength: number;
}
