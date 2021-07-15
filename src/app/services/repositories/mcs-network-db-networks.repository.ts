import { Injectable } from '@angular/core';
import {
  McsApiClientFactory,
  McsApiNetworkDbFactory
} from '@app/api-client';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { McsNetworkDbNetwork } from '@app/models';

import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsNetworkDbDataContext } from '../data-context/mcs-network-db-networks-data.context';

@Injectable()
export class McsNetworkDbNetworksRepository extends McsRepositoryBase<McsNetworkDbNetwork> {

  constructor(
    _apiClientFactory: McsApiClientFactory,
    _eventDispatcher: EventBusDispatcherService
  ) {
    super(
      new McsNetworkDbDataContext(
        _apiClientFactory.getService(new McsApiNetworkDbFactory())
      ),
      _eventDispatcher,
      {
        dataChangeEvent: McsEvent.dataChangeNetworkDbNetworksEvent
      }
    );
  }
}
