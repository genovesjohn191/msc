import { Injectable } from '@angular/core';
import {
  McsApiClientFactory,
  McsApiConsoleFactory
} from '@app/api-client';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { McsConsole } from '@app/models';

import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsConsoleDataContext } from '../data-context/mcs-console-data.context';

@Injectable()
export class McsConsoleRepository extends McsRepositoryBase<McsConsole> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsConsoleDataContext(_apiClientFactory.getService(new McsApiConsoleFactory())),
      _eventDispatcher,
      {
        dataChangeEvent: McsEvent.dataChangeConsole
      }
    );
  }
}
