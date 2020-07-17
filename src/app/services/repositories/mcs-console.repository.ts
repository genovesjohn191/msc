import { Injectable } from '@angular/core';
import { McsConsole } from '@app/models';
import {
  McsApiClientFactory,
  McsApiConsoleFactory
} from '@app/api-client';
import { McsConsoleDataContext } from '../data-context/mcs-console-data.context';
import { McsRepositoryBase } from '../core/mcs-repository.base';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';

@Injectable()
export class McsConsoleRepository extends McsRepositoryBase<McsConsole> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsConsoleDataContext(_apiClientFactory.getService(new McsApiConsoleFactory())),
      _eventDispatcher
    );
  }
}
