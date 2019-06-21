import { Injectable } from '@angular/core';
import { McsOrder } from '@app/models';
import {
  McsApiClientFactory,
  McsApiOrdersFactory
} from '@app/api-client';
import { McsOrdersDataContext } from '../data-context/mcs-orders-data.context';
import { McsRepositoryBase } from '../core/mcs-repository.base';

@Injectable()
export class McsOrdersRepository extends McsRepositoryBase<McsOrder> {

  constructor(_apiClientFactory: McsApiClientFactory) {
    super(new McsOrdersDataContext(
      _apiClientFactory.getService(new McsApiOrdersFactory())
    ));
  }
}
