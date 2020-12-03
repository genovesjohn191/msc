import { Injectable } from '@angular/core';
import {
  McsApiClientFactory,
  McsApiCompaniesFactory
} from '@app/api-client';
import { McsEvent } from '@app/events';
import { McsCompany } from '@app/models';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';

import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsCompaniesDataContext } from '../data-context/mcs-companies-data.context';

@Injectable()
export class McsCompaniesRepository extends McsRepositoryBase<McsCompany> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsCompaniesDataContext(_apiClientFactory.getService(new McsApiCompaniesFactory())),
      _eventDispatcher,
      {
        dataChangeEvent: McsEvent.dataChangeCompanies
      }
    );
  }
}
