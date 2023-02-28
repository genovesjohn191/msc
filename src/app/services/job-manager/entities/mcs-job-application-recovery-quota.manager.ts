import { Injector } from '@angular/core';
import { EventBusDispatcherService } from '@app/event-bus';
import {
  ActionStatus,
  EntityRequester,
  McsApplicationRecovery
} from '@app/models';
import { McsApplicationRecoveryRepository } from '@app/services/repositories/mcs-application-recovery.repository';

import { McsJobEntityBase } from '../base/mcs-job-entity.base';

export class McsJobApplicationRecoveryQuotaManager extends McsJobEntityBase<McsApplicationRecovery> {

  constructor(_actionStatus: ActionStatus, _injector: Injector, private _customJobReferenceId?: string) {
    super(
      EntityRequester.ApplicationRecovery,
      _injector.get(McsApplicationRecoveryRepository),
      _actionStatus,
      _injector.get(EventBusDispatcherService)
    );
  }

  protected getJobReferenceId(): string {
    return this._customJobReferenceId || 'serviceId';
  }
}