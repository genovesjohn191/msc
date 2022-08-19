import { Injectable } from '@angular/core';
import { McsAccessControlService } from '@app/core';
import {
  FieldSelectDatasource,
  IFieldSelectService
} from '@app/features-shared';
import { McsApiService } from '@app/services';
import { isNullOrEmpty } from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { SelectMediaExtensionDatasource } from './datasources/factories/select-media-extension.datasource';
import { SelectResourceCatalogDatasource } from './datasources/factories/select-resource-catalog.datasource';
import { SelectResourceDatasource } from './datasources/factories/select-resource.datasource';
import { SelectServerConsoleDatasource } from './datasources/factories/select-server-console.datasource';
import { SelectServerDatasource } from './datasources/factories/select-server.datasource';
import { SelectTicketTypeDatasource } from './datasources/factories/select-ticket-type.datasource';
import { SelectVCenterBaselineDatasource } from './datasources/factories/select-vcenter-baseline.datasource';
import { SelectVCenterDataCentreDatasource } from './datasources/factories/select-vcenter-datacentre.datasource';
import { SelectVCenterInstanceDatasource } from './datasources/factories/select-vcenter-instance.datasource';

export enum SelectDatasourceType {
  None = 0,
  TicketType,
  MediaExtension,
  Resource,
  ResourceCatalog,
  Server,
  ServerConsole,
  VCenterInstance,
  VCenterBaseline,
  VCenterDatacentre
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
      new SelectServerConsoleDatasource(_accessControl, _apiService, _translate));

    this._selectDatasourceMap.set(SelectDatasourceType.VCenterInstance,
      new SelectVCenterInstanceDatasource(_apiService));

    this._selectDatasourceMap.set(SelectDatasourceType.VCenterBaseline,
      new SelectVCenterBaselineDatasource(_apiService, _translate));

    this._selectDatasourceMap.set(SelectDatasourceType.VCenterDatacentre,
      new SelectVCenterDataCentreDatasource(_apiService));
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
