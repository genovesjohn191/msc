import { Injectable } from '@angular/core';
import {
  McsTicket
} from '@app/models';
import {
  McsApiClientFactory,
  McsApiTicketsFactory
} from '@app/api-client';
import { McsTicketsDataContext } from '../data-context/mcs-tickets-data.context';
import { McsRepositoryBase } from '../core/mcs-repository.base';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';

@Injectable()
export class McsTicketsRepository extends McsRepositoryBase<McsTicket> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsTicketsDataContext(_apiClientFactory.getService(new McsApiTicketsFactory())),
      _eventDispatcher);
  }
}
