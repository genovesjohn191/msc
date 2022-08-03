import { Injectable } from '@angular/core';
import {
  McsApiClientFactory,
  McsApiVCenterFactory
} from '@app/api-client';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { McsVCenterBaseline } from '@app/models';

import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsVCenterBaselinesDataContext } from '../data-context/mcs-vcenter-baselines-data.context';

@Injectable()
export class McsVCenterBaselinesRepository extends McsRepositoryBase<McsVCenterBaseline> {

  constructor(
    _apiClientFactory: McsApiClientFactory,
    _eventDispatcher: EventBusDispatcherService
  ) {
    super(
      new McsVCenterBaselinesDataContext(
        _apiClientFactory.getService(new McsApiVCenterFactory())
      ),
      _eventDispatcher,
      {
        dataChangeEvent: McsEvent.dataChangeVCenterBaselineEvent,
        dataClearEvent: McsEvent.dataClearVCenterBaseline
      }
    );
  }
}
