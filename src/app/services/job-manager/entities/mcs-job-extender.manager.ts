import { Injector } from '@angular/core';
import { EventBusDispatcherService } from '@app/event-bus';
import {
  ActionStatus,
  EntityRequester,
  McsExtenderService
} from '@app/models';
import { McsExtendersRepository } from '@app/services/repositories/mcs-extenders.repository';

import { McsJobEntityBase } from '../base/mcs-job-entity.base';

export class McsJobExtenderManager extends McsJobEntityBase<McsExtenderService> {

  constructor(_actionStatus: ActionStatus, _injector: Injector, private _customJobReferenceId?: string) {
    super(
      EntityRequester.Extender,
      _injector.get(McsExtendersRepository),
      _actionStatus,
      _injector.get(EventBusDispatcherService)
    );
  }

  protected getJobReferenceId(): string {
    return this._customJobReferenceId || 'serviceId';
  }
}