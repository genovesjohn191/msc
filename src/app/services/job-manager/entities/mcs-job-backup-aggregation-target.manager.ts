import {
  ActionStatus,
  EntityRequester,
  McsBackUpAggregationTarget
} from '@app/models';
import { Injector } from '@angular/core';
import { McsBatsRepository } from '../../repositories/mcs-bats.repository';
import { McsJobEntityBase } from '../base/mcs-job-entity.base';

export class McsJobBackupAggregationTargetManager extends McsJobEntityBase<McsBackUpAggregationTarget> {

  constructor(_actionStatus: ActionStatus, _injector: Injector, private _customJobReferenceId?: string) {
    super(EntityRequester.BackupAggregationTarget, _injector.get(McsBatsRepository), _actionStatus);
  }

  protected getJobReferenceId(): string {
    return this._customJobReferenceId || 'serviceId';
  }
}
