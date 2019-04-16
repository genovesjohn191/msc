import { Injectable } from '@angular/core';
import { McsOrderItemType } from '@app/models';
import { McsRepositoryBase } from '@app/core';
import {
  McsApiClientFactory,
  McsApiOrdersFactory
} from '@app/api-client';
import { McsOrderItemTypesDataContext } from '../data-context/mcs-order-item-types-data.context';

@Injectable()
export class McsOrderItemTypesRepository extends McsRepositoryBase<McsOrderItemType> {

  constructor(_apiClientFactory: McsApiClientFactory) {
    super(new McsOrderItemTypesDataContext(
      _apiClientFactory.getService(new McsApiOrdersFactory())
    ));
  }
}
