import { Injectable } from '@angular/core';
import {
  McsApiClientFactory,
  McsApiServersFactory
} from '@app/api-client';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { McsServer } from '@app/models';

import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsServersDataContext } from '../data-context/mcs-servers-data.context';

@Injectable()
export class McsServersRepository extends McsRepositoryBase<McsServer> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsServersDataContext(_apiClientFactory.getService(new McsApiServersFactory())),
      _eventDispatcher,
      {
        dataChangeEvent: McsEvent.dataChangeServers,
        dataClearEvent: McsEvent.dataClearServers
      }
    );
  }
}
