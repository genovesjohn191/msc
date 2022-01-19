import { Injectable } from '@angular/core';
import {
  McsApiApplicationRecoveryFactory,
  McsApiClientFactory
} from '@app/api-client';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { McsApplicationRecovery } from '@app/models';

import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsApplicationRecoveryDataContext } from '../data-context/mcs-application-recovery-data.context';

@Injectable()
export class McsApplicationRecoveryRepository extends McsRepositoryBase<McsApplicationRecovery> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsApplicationRecoveryDataContext(_apiClientFactory.getService(new McsApiApplicationRecoveryFactory())),
      _eventDispatcher,
      {
        dataChangeEvent: McsEvent.dataChangeApplicationRecovery
      }
    );
  }
}
