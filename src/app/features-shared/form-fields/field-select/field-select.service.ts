export enum SelectDatasourceType {
  None = 0,
  TicketType,
  MediaExtension,
  Resource,
  ResourceCatalog
}

import { Injectable } from '@angular/core';
import {
  FieldSelectDatasource,
  IFieldSelectService
} from '@app/features-shared';
import { McsApiService } from '@app/services';
import { isNullOrEmpty } from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import {
  SelectMediaExtensionDatasource,
  SelectResourceCatalogDatasource,
  SelectResourceDatasource,
  SelectTicketTypeDatasource
} from './datasources';

@Injectable({ providedIn: 'root' })
export class FieldSelectService implements IFieldSelectService {
  private readonly _selectDatasourceMap = new Map<SelectDatasourceType, FieldSelectDatasource>();

  constructor(
    _translate: TranslateService,
    _apiService: McsApiService
  ) {
    this._selectDatasourceMap.set(SelectDatasourceType.TicketType,
      new SelectTicketTypeDatasource());

    this._selectDatasourceMap.set(SelectDatasourceType.MediaExtension,
      new SelectMediaExtensionDatasource());

    this._selectDatasourceMap.set(SelectDatasourceType.Resource,
      new SelectResourceDatasource(_apiService));

    this._selectDatasourceMap.set(SelectDatasourceType.ResourceCatalog,
      new SelectResourceCatalogDatasource(_apiService));
  }

  public get(type: string, data?: any): FieldSelectDatasource {
    let selectDatasource = this._selectDatasourceMap.get(SelectDatasourceType[type]);
    if (isNullOrEmpty(selectDatasource)) {
      console.error(`Unable to find select datasource for ${type}`);
      return null;
    }

    selectDatasource.initialize(data);
    return selectDatasource;
  }
}
