import {
  Inject,
  Pipe,
  PipeTransform
} from '@angular/core';
import { isNullOrEmpty } from '@app/utilities';

import { FieldSelectPrerequisite } from './datasources/field-select.prerequisite';
import { FieldSelectDatasource } from './field-select.datasource';
import {
  IFieldSelectService,
  MCS_FIELD_SELECT_TOKEN
} from './services/field-select.service';

@Pipe({
  name: 'mcsFieldSelect'
})
export class FieldSelectPipe implements PipeTransform {

  constructor(
    @Inject(MCS_FIELD_SELECT_TOKEN)
    private _fieldSelectToken: IFieldSelectService
  ) { }

  public transform(
    value: string,
    config?: FieldSelectPrerequisite<any>
  ): FieldSelectDatasource {
    if (isNullOrEmpty(this._fieldSelectToken)) {
      throw new Error('MCS_FIELD_SELECT_TOKEN was not registered.');
    }
    return this._fieldSelectToken?.get(value, config);
  }
}
