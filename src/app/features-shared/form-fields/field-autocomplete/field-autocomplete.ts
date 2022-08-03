import { EventEmitter } from '@angular/core';
import { McsOption } from '@app/models';

import { IFormField } from '../abstraction/form-field.interface';
import { FieldAutocompleteDatasource } from './field-autocomplete.datasource';

export interface IFieldAutocomplete extends IFormField {
  dataSource: FieldAutocompleteDatasource;
  optionsChange: EventEmitter<McsOption[]>;
}
