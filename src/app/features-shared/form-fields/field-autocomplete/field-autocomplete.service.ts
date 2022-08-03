import { Injectable } from '@angular/core';
import { McsAccessControlService } from '@app/core';
import { McsApiService } from '@app/services';
import { isNullOrEmpty } from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { AutocompleteCompanyDatasource } from './datasources';
import { FieldAutocompleteDatasource } from './field-autocomplete.datasource';
import { IFieldAutocompleteService } from './services/field-autocomplete.service';

export enum AutocompleteDatasourceType {
  None = 0,
  Company
}

@Injectable({ providedIn: 'root' })
export class FieldAutocompleteService implements IFieldAutocompleteService {
  private readonly _datasourceMap = new Map<AutocompleteDatasourceType, FieldAutocompleteDatasource>();

  constructor(
    _translate: TranslateService,
    _apiService: McsApiService,
    _accessControl: McsAccessControlService
  ) {
    this._datasourceMap.set(AutocompleteDatasourceType.Company,
      new AutocompleteCompanyDatasource(_apiService));
  }

  public get(type: string, data?: any): FieldAutocompleteDatasource {
    let datasource = this._datasourceMap.get(AutocompleteDatasourceType[type]);
    if (isNullOrEmpty(datasource)) {
      console.error(`Unable to find autocomplete datasource for ${type}`);
      return null;
    }

    datasource.initialize(data);
    return datasource;
  }
}
