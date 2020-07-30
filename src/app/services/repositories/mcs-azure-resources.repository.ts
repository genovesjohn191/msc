import { Injectable } from '@angular/core';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import {
  McsApiClientFactory,
  McsApiAzureResourceFactory
} from '@app/api-client';
import { McsAzureResource } from '@app/models';
import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsAzureResourceDataContext } from '../data-context/mcs-azure-resource-data.context';

@Injectable()
export class McsAzureResourcesRepository extends McsRepositoryBase<McsAzureResource> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsAzureResourceDataContext(_apiClientFactory.getService(new McsApiAzureResourceFactory())),
      _eventDispatcher
    );
  }
}
