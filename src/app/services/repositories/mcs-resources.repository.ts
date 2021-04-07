import { Injectable } from '@angular/core';
import {
  McsApiClientFactory,
  McsApiResourcesFactory
} from '@app/api-client';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { McsResource } from '@app/models';

import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsResourcesDataContext } from '../data-context/mcs-resources-data.context';

@Injectable()
export class McsResourcesRepository extends McsRepositoryBase<McsResource> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsResourcesDataContext(_apiClientFactory.getService(new McsApiResourcesFactory())),
      _eventDispatcher,
      {
        dataChangeEvent: McsEvent.dataChangeResources
      }
    );
  }
}
