import { Injectable } from '@angular/core';
import {
  McsApiClientFactory,
  McsApiFirewallsFactory
} from '@app/api-client';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { McsFirewall } from '@app/models';

import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsFirewallsDataContext } from '../data-context/mcs-firewalls-data.context';

@Injectable()
export class McsFirewallsRepository extends McsRepositoryBase<McsFirewall> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsFirewallsDataContext(_apiClientFactory.getService(new McsApiFirewallsFactory())),
      _eventDispatcher,
      {
        dataChangeEvent: McsEvent.dataChangeFirewalls
      }
    );
  }
}
