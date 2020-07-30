import { Injectable } from '@angular/core';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import {
McsApiClientFactory,
McsApiAzureServicesFactory
} from '@app/api-client';
import { McsAzureService } from '@app/models';
import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsAzureServicesDataContext } from '../data-context/mcs-azure-services-data.context';

@Injectable()
export class McsAzureServicesRepository extends McsRepositoryBase<McsAzureService> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsAzureServicesDataContext(_apiClientFactory.getService(new McsApiAzureServicesFactory())),
      _eventDispatcher
    );
  }
}
