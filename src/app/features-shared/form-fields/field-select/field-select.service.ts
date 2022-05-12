import { Injectable } from '@angular/core';
import { McsAccessControlService } from '@app/core';
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
import { SelectServerConsoleDatasource } from './datasources/factories/select-server-console.datasource';
import { SelectServerDatasource } from './datasources/factories/select-server.datasource';

export enum SelectDatasourceType {
  None = 0,
  TicketType,
  MediaExtension,
  Resource,
  ResourceCatalog,
  Server,
  ServerConsole
}

@Injectable({ providedIn: 'root' })
export class FieldSelectService implements IFieldSelectService {
  private readonly _selectDatasourceMap = new Map<SelectDatasourceType, FieldSelectDatasource>();

  constructor(
    _translate: TranslateService,
    _apiService: McsApiService,
    _accessControl: McsAccessControlService
  ) {
    this._selectDatasourceMap.set(SelectDatasourceType.TicketType,
      new SelectTicketTypeDatasource());

    this._selectDatasourceMap.set(SelectDatasourceType.MediaExtension,
      new SelectMediaExtensionDatasource());

    this._selectDatasourceMap.set(SelectDatasourceType.Resource,
      new SelectResourceDatasource(_apiService));

    this._selectDatasourceMap.set(SelectDatasourceType.ResourceCatalog,
      new SelectResourceCatalogDatasource(_apiService));

    this._selectDatasourceMap.set(SelectDatasourceType.Server,
      new SelectServerDatasource(_apiService));

    this._selectDatasourceMap.set(SelectDatasourceType.ServerConsole,
      new SelectServerConsoleDatasource(_accessControl,_apiService, _translate));
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
