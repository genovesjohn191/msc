import { InjectionToken } from '@angular/core';

import { FieldAutocompletePrerequisite } from '../datasources';
import { FieldAutocompleteDatasource } from '../field-autocomplete.datasource';

export interface IFieldAutocompleteService {
  get(type: string, config?: FieldAutocompletePrerequisite<any>): FieldAutocompleteDatasource;
}

export const MCS_FIELD_AUTOCOMPLETE_TOKEN = new InjectionToken<IFieldAutocompleteService>('IFieldAutocompleteService');
