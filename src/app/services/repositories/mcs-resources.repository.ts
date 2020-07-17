import { Injectable } from '@angular/core';
import { McsResource } from '@app/models';
import {
  McsApiResourcesFactory,
  McsApiClientFactory
} from '@app/api-client';
import { McsResourcesDataContext } from '../data-context/mcs-resources-data.context';
import { McsRepositoryBase } from '../core/mcs-repository.base';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';

@Injectable()
export class McsResourcesRepository extends McsRepositoryBase<McsResource> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsResourcesDataContext(_apiClientFactory.getService(new McsApiResourcesFactory())),
      _eventDispatcher
    );
  }
}
