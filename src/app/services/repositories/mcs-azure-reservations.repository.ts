import { Injectable } from '@angular/core';
import {
  McsApiAzureReservationsFactory,
  McsApiClientFactory
} from '@app/api-client';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { McsAzureReservation } from '@app/models';

import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsAzureReservationsDataContext } from '../data-context/mcs-azure-reservations-data.context';

@Injectable()
export class McsAzureReservationsRepository extends McsRepositoryBase<McsAzureReservation> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsAzureReservationsDataContext(_apiClientFactory.getService(new McsApiAzureReservationsFactory())),
      _eventDispatcher,
      {
        dataChangeEvent: McsEvent.dataChangeAzureReservations
      }
    );
  }
}
