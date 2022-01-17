import { IFormField } from '../abstraction/form-field.interface';
import { FieldSelectDatasource } from './field-select.datasource';

export interface IFieldSelect extends IFormField {
  multiple: boolean;
  dataSource: FieldSelectDatasource;
}
