import { Injectable } from '@angular/core';
import {
  McsApiClientFactory,
  McsApiNonStandardBundleFactory
} from '@app/api-client';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { McsNonStandardBundle } from '@app/models';

import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsNonStandardBundlesDataContext } from '../data-context/mcs-non-standard-bundles-data.context';

@Injectable()
export class McsNonStandardBundlesRepository extends McsRepositoryBase<McsNonStandardBundle> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsNonStandardBundlesDataContext(_apiClientFactory.getService(new McsApiNonStandardBundleFactory())),
      _eventDispatcher,
      {
        dataChangeEvent: McsEvent.dataChangeNonStandardBundles
      }
    );
  }
}
