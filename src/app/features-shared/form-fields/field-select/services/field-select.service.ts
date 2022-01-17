import { InjectionToken } from '@angular/core';

import { FieldSelectPrerequisite } from '../datasources/field-select.prerequisite';
import { FieldSelectDatasource } from '../field-select.datasource';

export interface IFieldSelectService {
  get(type: string, config?: FieldSelectPrerequisite<any>): FieldSelectDatasource;
}

export const MCS_FIELD_SELECT_TOKEN = new InjectionToken<IFieldSelectService>('IFieldSelectService');
