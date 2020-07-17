import { Injectable } from '@angular/core';
import { McsResourceMedia } from '@app/models';
import {
  McsApiClientFactory,
  McsApiMediaFactory
} from '@app/api-client';
import { McsMediaDataContext } from '../data-context/mcs-media-data.context';
import { McsRepositoryBase } from '../core/mcs-repository.base';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';

@Injectable()
export class McsMediaRepository extends McsRepositoryBase<McsResourceMedia> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsMediaDataContext(_apiClientFactory.getService(new McsApiMediaFactory())),
      _eventDispatcher
    );
  }
}
