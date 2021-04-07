import { Injector } from '@angular/core';
import { EventBusDispatcherService } from '@app/event-bus';
import {
  ActionStatus,
  EntityRequester,
  McsInternetPort
} from '@app/models';
import { McsInternetRepository } from '@app/services/repositories/mcs-internet.repository';

import { McsJobEntityBase } from '../base/mcs-job-entity.base';

export class McsJobInternetManager extends McsJobEntityBase<McsInternetPort> {

  constructor(_actionStatus: ActionStatus, _injector: Injector, private _customJobReferenceId?: string) {
    super(
      EntityRequester.Internet,
      _injector.get(McsInternetRepository),
      _actionStatus,
      _injector.get(EventBusDispatcherService)
    );
  }

  protected getJobReferenceId(): string {
    return this._customJobReferenceId || 'serviceId';
  }
}