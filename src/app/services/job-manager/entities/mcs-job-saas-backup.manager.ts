import { Injector } from '@angular/core';
import { EventBusDispatcherService } from '@app/event-bus';
import {
  ActionStatus,
  EntityRequester
} from '@app/models';

import { McsBatsRepository } from '../../repositories/mcs-bats.repository';
import { McsJobEntityBase } from '../base/mcs-job-entity.base';

export class McsJobSaasBackupManager extends McsJobEntityBase<any> {

  constructor(_actionStatus: ActionStatus, _injector: Injector, private _customJobReferenceId?: string) {
    super(
      EntityRequester.SaasBackup,
      _injector.get(McsBatsRepository),
      _actionStatus,
      _injector.get(EventBusDispatcherService)
    );
  }

  protected getJobReferenceId(): string {
    return this._customJobReferenceId || 'serviceId';
  }
}
