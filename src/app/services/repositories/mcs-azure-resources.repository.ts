import { Injectable } from '@angular/core';
import {
  McsApiAzureResourceFactory,
  McsApiClientFactory
} from '@app/api-client';
import { McsEvent } from '@app/events';
import { McsAzureResource } from '@app/models';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';

import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsAzureResourceDataContext } from '../data-context/mcs-azure-resource-data.context';

@Injectable()
export class McsAzureResourcesRepository extends McsRepositoryBase<McsAzureResource> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsAzureResourceDataContext(_apiClientFactory.getService(new McsApiAzureResourceFactory())),
      _eventDispatcher,
      {
        dataChangeEvent: McsEvent.dataChangeAzureResources
      }
    );
  }
}
