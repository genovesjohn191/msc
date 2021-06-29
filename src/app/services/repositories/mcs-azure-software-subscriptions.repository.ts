import { Injectable } from '@angular/core';
import {
  McsApiAzureSoftwareSubscriptionsFactory,
  McsApiClientFactory
} from '@app/api-client';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { McsAzureSoftwareSubscription } from '@app/models';

import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsAzureSoftwareSubscriptionsDataContext } from '../data-context/mcs-azure-software-subscriptions-data.context';

@Injectable()
export class McsAzureSoftwareSubscriptionsRepository extends McsRepositoryBase<McsAzureSoftwareSubscription> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsAzureSoftwareSubscriptionsDataContext(_apiClientFactory.getService(new McsApiAzureSoftwareSubscriptionsFactory())),
      _eventDispatcher,
      {
        dataChangeEvent: McsEvent.dataChangeAzureSoftwareSubscriptions
      }
    );
  }
}
