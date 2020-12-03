import { Injectable } from '@angular/core';
import {
  McsApiClientFactory,
  McsApiTicketsFactory
} from '@app/api-client';
import { McsEvent } from '@app/events';
import { McsTicket } from '@app/models';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';

import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsTicketsDataContext } from '../data-context/mcs-tickets-data.context';

@Injectable()
export class McsTicketsRepository extends McsRepositoryBase<McsTicket> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsTicketsDataContext(_apiClientFactory.getService(new McsApiTicketsFactory())),
      _eventDispatcher,
      {
        dataChangeEvent: McsEvent.dataChangeTickets
      }
    );
  }
}
