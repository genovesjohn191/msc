import { Injectable } from '@angular/core';
import {
  McsApiClientFactory,
  McsApiNoticesFactory
} from '@app/api-client';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { McsNotice } from '@app/models';

import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsNoticesDataContext } from '../data-context/mcs-notices.data.context';

@Injectable()
export class McsNoticesRepository extends McsRepositoryBase<McsNotice> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsNoticesDataContext(_apiClientFactory.getService(new McsApiNoticesFactory())),
      _eventDispatcher,
      {
        dataChangeEvent: McsEvent.dataChangeNotices
      }
    );
  }
}
