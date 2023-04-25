import { Injectable } from '@angular/core';
import {
  McsApiClientFactory,
  McsApiManagedSiemServicesFactory
} from '@app/api-client';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { McsManagedSiemService } from '@app/models';

import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsManagedSiemServicesDataContext } from '../data-context/mcs-managed-siem-services-data.context';

@Injectable()
export class McsManagedSiemServicesRepository extends McsRepositoryBase<McsManagedSiemService> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsManagedSiemServicesDataContext(_apiClientFactory.getService(new McsApiManagedSiemServicesFactory())),
      _eventDispatcher,
      {
        dataChangeEvent: McsEvent.dataChangeManagedSiemServices
      }
    );
  }
}
