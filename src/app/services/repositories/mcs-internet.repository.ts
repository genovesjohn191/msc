import { Injectable } from '@angular/core';
import { McsInternetPort } from '@app/models';
import {
  McsApiClientFactory,
  McsApiInternetFactory
} from '@app/api-client';
import { McsInternetDataContext } from '../data-context/mcs-internet-data.context';
import { McsRepositoryBase } from '../core/mcs-repository.base';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';

@Injectable()
export class McsInternetRepository extends McsRepositoryBase<McsInternetPort> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsInternetDataContext(_apiClientFactory.getService(new McsApiInternetFactory())),
      _eventDispatcher);
  }
}
