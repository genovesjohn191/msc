import { Injectable } from '@angular/core';
import {
  McsApiClientFactory,
  McsApiSystemFactory
} from '@app/api-client';
import { McsEvent } from '@app/events';
import { McsSystemMessage } from '@app/models';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';

import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsSystemMessagesDataContext } from '../data-context/mcs-system-messages-data.context';

@Injectable()
export class McsSystemMessagesRepository extends McsRepositoryBase<McsSystemMessage> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsSystemMessagesDataContext(_apiClientFactory.getService(new McsApiSystemFactory())),
      _eventDispatcher,
      {
        dataChangeEvent: McsEvent.dataChangeSystemMessages,
        dataClearEvent: McsEvent.dataClearSystemMessage
      }
    );
  }
}
