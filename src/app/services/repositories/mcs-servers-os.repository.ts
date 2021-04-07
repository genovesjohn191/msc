import { Injectable } from '@angular/core';
import {
  McsApiClientFactory,
  McsApiServersFactory
} from '@app/api-client';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsServerOperatingSystem } from '@app/models';

import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsServersOsDataContext } from '../data-context/mcs-servers-os-data.context';

@Injectable()
export class McsServersOsRepository extends McsRepositoryBase<McsServerOperatingSystem> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsServersOsDataContext(_apiClientFactory.getService(new McsApiServersFactory())),
      _eventDispatcher
    );
  }
}
