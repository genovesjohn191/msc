import { Injectable } from '@angular/core';
import { McsServerOperatingSystem } from '@app/models';
import {
  McsApiClientFactory,
  McsApiServersFactory
} from '@app/api-client';
import { McsServersOsDataContext } from '../data-context/mcs-servers-os-data.context';
import { McsRepositoryBase } from '../core/mcs-repository.base';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';

@Injectable()
export class McsServersOsRepository extends McsRepositoryBase<McsServerOperatingSystem> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsServersOsDataContext(_apiClientFactory.getService(new McsApiServersFactory())),
      _eventDispatcher
    );
  }
}
