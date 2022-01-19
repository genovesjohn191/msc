import { Injectable } from '@angular/core';
import {
  McsApiAzureManagementServicesFactory,
  McsApiClientFactory
} from '@app/api-client';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { McsAzureManagementService } from '@app/models';

import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsAzureManagementServicesDataContext } from '../data-context/mcs-azure-management-services-data.context';

@Injectable()
export class McsAzureManagementServicesRepository extends McsRepositoryBase<McsAzureManagementService> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsAzureManagementServicesDataContext(_apiClientFactory.getService(new McsApiAzureManagementServicesFactory())),
      _eventDispatcher,
      {
        dataChangeEvent: McsEvent.dataChangeAzureManagementServices
      }
    );
  }
}
