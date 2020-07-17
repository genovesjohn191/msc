import { Injectable } from '@angular/core';
import { McsFirewall } from '@app/models';
import {
  McsApiClientFactory,
  McsApiFirewallsFactory
} from '@app/api-client';
import { McsFirewallsDataContext } from '../data-context/mcs-firewalls-data.context';
import { McsRepositoryBase } from '../core/mcs-repository.base';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';

@Injectable()
export class McsFirewallsRepository extends McsRepositoryBase<McsFirewall> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsFirewallsDataContext(_apiClientFactory.getService(new McsApiFirewallsFactory())),
      _eventDispatcher
    );
  }
}
