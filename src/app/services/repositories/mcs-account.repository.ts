import { Injectable } from '@angular/core';
import {
  McsApiAccountFactory,
  McsApiClientFactory
} from '@app/api-client';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsAccount } from '@app/models';

import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsAccountDataContext } from '../data-context/mcs-account-data.context';

@Injectable()
export class McsAccountRepository extends McsRepositoryBase<McsAccount> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsAccountDataContext(_apiClientFactory.getService(new McsApiAccountFactory())),
      _eventDispatcher
    );
  }
}
