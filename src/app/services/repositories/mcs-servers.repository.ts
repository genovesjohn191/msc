import { Injectable } from '@angular/core';
import { McsServer } from '@app/models';
import {
  McsApiClientFactory,
  McsApiServersFactory
} from '@app/api-client';
import { McsServersDataContext } from '../data-context/mcs-servers-data.context';
import { McsRepositoryBase } from '../core/mcs-repository.base';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';

@Injectable()
export class McsServersRepository extends McsRepositoryBase<McsServer> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsServersDataContext(_apiClientFactory.getService(new McsApiServersFactory())),
      _eventDispatcher);
  }
}
