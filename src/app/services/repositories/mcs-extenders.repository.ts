import { Injectable } from '@angular/core';
import {
  McsApiExtendersFactory,
  McsApiClientFactory
} from '@app/api-client';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { McsExtenderService } from '@app/models';

import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsExtendersDataContext } from '../data-context/mcs-extenders-data.context';

@Injectable()
export class McsExtendersRepository extends McsRepositoryBase<McsExtenderService> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsExtendersDataContext(_apiClientFactory.getService(new McsApiExtendersFactory())),
      _eventDispatcher,
      {
        dataChangeEvent: McsEvent.dataChangeExtenders
      }
    );
  }
}
