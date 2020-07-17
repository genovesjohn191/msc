import { Injectable } from '@angular/core';
import {
  McsApiClientFactory,
  McsApiAccountFactory
} from '@app/api-client';
import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsAccount } from '@app/models';
import { McsAccountDataContext } from '../data-context/mcs-account-data.context';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';

@Injectable()
export class McsAccountRepository extends McsRepositoryBase<McsAccount> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsAccountDataContext(_apiClientFactory.getService(new McsApiAccountFactory())),
      _eventDispatcher
    );
  }
}
