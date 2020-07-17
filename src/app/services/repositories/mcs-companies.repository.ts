import { Injectable } from '@angular/core';
import { McsCompany } from '@app/models';
import {
  McsApiClientFactory,
  McsApiCompaniesFactory
} from '@app/api-client';
import { McsCompaniesDataContext } from '../data-context/mcs-companies-data.context';
import { McsRepositoryBase } from '../core/mcs-repository.base';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';

@Injectable()
export class McsCompaniesRepository extends McsRepositoryBase<McsCompany> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsCompaniesDataContext(_apiClientFactory.getService(new McsApiCompaniesFactory())),
      _eventDispatcher
    );
  }
}
