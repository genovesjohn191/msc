import { Injectable } from '@angular/core';
import {
  McsApiClientFactory,
  McsApiTerraformFactory
} from '@app/api-client';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { McsTerraformDeployment } from '@app/models';

import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsTerraformDeploymentsDataContext } from '../data-context/mcs-terraform-deployments-data.context';

@Injectable()
export class McsTerraformDeploymentsRepository extends McsRepositoryBase<McsTerraformDeployment> {

  constructor(
    _apiClientFactory: McsApiClientFactory,
    _eventDispatcher: EventBusDispatcherService
  ) {
    super(
      new McsTerraformDeploymentsDataContext(
        _apiClientFactory.getService(new McsApiTerraformFactory())
      ),
      _eventDispatcher,
      {
        dataChangeEvent: McsEvent.dataChangeTerraformDeployments,
        dataClearEvent: McsEvent.dataClearTerraformDeployments
      }
    );
  }
}
