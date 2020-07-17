import { Injectable } from '@angular/core';
import {
McsApiClientFactory,
McsApiSubscriptionsFactory
} from '@app/api-client';
import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsSubscription } from '@app/models';
import { McsSubscriptionsDataContext } from '../data-context/mcs-subscriptions-data.context';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';

@Injectable()
export class McsSubscriptionsRepository extends McsRepositoryBase<McsSubscription> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsSubscriptionsDataContext(_apiClientFactory.getService(new McsApiSubscriptionsFactory())),
      _eventDispatcher
    );
  }
}
