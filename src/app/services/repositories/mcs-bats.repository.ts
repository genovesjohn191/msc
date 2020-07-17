import { Injectable } from '@angular/core';
import { McsBackUpAggregationTarget } from '@app/models';
import {
  McsApiClientFactory,
  McsApiBatsFactory
} from '@app/api-client';
import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsBatsDataContext } from '../data-context/mcs-bats-data.context';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';

@Injectable()
export class McsBatsRepository extends McsRepositoryBase<McsBackUpAggregationTarget> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsBatsDataContext(_apiClientFactory.getService(new McsApiBatsFactory())),
      _eventDispatcher
    );
  }
}
