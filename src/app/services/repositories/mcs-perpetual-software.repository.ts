import { Injectable } from '@angular/core';
import {
  McsApiClientFactory,
  McsApiPerpetualSoftwareFactory
} from '@app/api-client';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { McsPerpetualSoftware } from '@app/models';

import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsPerpetualSoftwareDataContext } from '../data-context/mcs-perpetual-software-data.context';

@Injectable()
export class McsPerpetualSoftwareRepository extends McsRepositoryBase<McsPerpetualSoftware> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsPerpetualSoftwareDataContext(_apiClientFactory.getService(new McsApiPerpetualSoftwareFactory())),
      _eventDispatcher,
      {
        dataChangeEvent: McsEvent.dataChangePerpetualSoftware
      }
    );
  }
}
