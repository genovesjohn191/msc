import {
  Inject,
  Pipe,
  PipeTransform
} from '@angular/core';
import { isNullOrEmpty } from '@app/utilities';

import { FieldAutocompletePrerequisite } from './datasources';
import { FieldAutocompleteDatasource } from './field-autocomplete.datasource';
import {
  IFieldAutocompleteService,
  MCS_FIELD_AUTOCOMPLETE_TOKEN
} from './services/field-autocomplete.service';

@Pipe({
  name: 'mcsFieldAutocomplete'
})
export class FieldAutocompletePipe implements PipeTransform {

  constructor(
    @Inject(MCS_FIELD_AUTOCOMPLETE_TOKEN)
    private _fieldAutocompleteToken: IFieldAutocompleteService
  ) { }

  public transform(
    value: string,
    config?: FieldAutocompletePrerequisite<any>
  ): FieldAutocompleteDatasource {
    if (isNullOrEmpty(this._fieldAutocompleteToken)) {
      throw new Error('MCS_FIELD_AUTOCOMPLETE_TOKEN was not registered.');
    }
    return this._fieldAutocompleteToken?.get(value, config);
  }
}
