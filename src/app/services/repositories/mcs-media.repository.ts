import { Injectable } from '@angular/core';
import {
  McsApiClientFactory,
  McsApiMediaFactory
} from '@app/api-client';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { McsResourceMedia } from '@app/models';

import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsMediaDataContext } from '../data-context/mcs-media-data.context';

@Injectable()
export class McsMediaRepository extends McsRepositoryBase<McsResourceMedia> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsMediaDataContext(_apiClientFactory.getService(new McsApiMediaFactory())),
      _eventDispatcher,
      {
        dataChangeEvent: McsEvent.dataChangeMedia,
        dataClearEvent: McsEvent.dataClearMedia
      }
    );
  }
}
