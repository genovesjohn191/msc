import { Injectable } from '@angular/core';
import { McsApiClientFactory } from '@app/api-client';
import { McsApiLicensesFactory } from '@app/api-client/factory/mcs-api-licenses.factory';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsLicense } from '@app/models';

import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsLicensesDataContext } from '../data-context/mcs-licenses-data.context';

@Injectable()
export class McsLicensesRepository extends McsRepositoryBase<McsLicense> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsLicensesDataContext(_apiClientFactory.getService(new McsApiLicensesFactory())),
      _eventDispatcher
    );
  }
}
