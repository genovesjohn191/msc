import { Injectable } from '@angular/core';
import {
  McsApiClientFactory,
  McsApiOrdersFactory
} from '@app/api-client';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { McsOrder } from '@app/models';

import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsOrdersDataContext } from '../data-context/mcs-orders-data.context';

@Injectable()
export class McsOrdersRepository extends McsRepositoryBase<McsOrder> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsOrdersDataContext(_apiClientFactory.getService(new McsApiOrdersFactory())),
      _eventDispatcher,
      {
        dataChangeEvent: McsEvent.dataChangeOrders
      }
    );
  }
}
