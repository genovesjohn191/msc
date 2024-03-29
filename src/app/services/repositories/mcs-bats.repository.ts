import { Injectable } from '@angular/core';
import {
  McsApiBatsFactory,
  McsApiClientFactory
} from '@app/api-client';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { McsBackUpAggregationTarget } from '@app/models';

import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsBatsDataContext } from '../data-context/mcs-bats-data.context';

@Injectable()
export class McsBatsRepository extends McsRepositoryBase<McsBackUpAggregationTarget> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsBatsDataContext(_apiClientFactory.getService(new McsApiBatsFactory())),
      _eventDispatcher,
      {
        dataChangeEvent: McsEvent.dataChangeAggregationTargets
      }
    );
  }
}
