import { Injectable } from '@angular/core';
import {
  McsApiClientFactory,
  McsApiInternetFactory
} from '@app/api-client';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { McsInternetPort } from '@app/models';

import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsInternetDataContext } from '../data-context/mcs-internet-data.context';

@Injectable()
export class McsInternetRepository extends McsRepositoryBase<McsInternetPort> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsInternetDataContext(_apiClientFactory.getService(new McsApiInternetFactory())),
      _eventDispatcher,
      {
        dataChangeEvent: McsEvent.dataChangeInternetPorts
      }
    );
  }
}
