import { Injectable } from '@angular/core';
import {
  McsApiClientFactory,
  McsApiAzureResourceFactory
} from '@app/api-client';
import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsAzureResource } from '@app/models';
import { McsAzureResourceDataContext } from '../data-context/mcs-azure-resource-data.context';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';

@Injectable()
export class McsAzureResourceRepository extends McsRepositoryBase<McsAzureResource> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsAzureResourceDataContext(_apiClientFactory.getService(new McsApiAzureResourceFactory())),
      _eventDispatcher
    );
  }
}
