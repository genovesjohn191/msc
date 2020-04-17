import {
  ActionStatus,
  EntityRequester,
  McsBackUpAggregationTarget
} from '@app/models';
import { Injector } from '@angular/core';
import { McsBackupAggregationTargetsRepository } from '../../repositories/mcs-backup-aggregation-targets.repository';
import { McsJobEntityBase } from '../base/mcs-job-entity.base';

export class McsJobBackupAggregationTargetManager extends McsJobEntityBase<McsBackUpAggregationTarget> {

  constructor(_actionStatus: ActionStatus, _injector: Injector, private _customJobReferenceId?: string) {
    super(EntityRequester.BackupAggregationTarget, _injector.get(McsBackupAggregationTargetsRepository), _actionStatus);
  }

  protected getJobReferenceId(): string {
    return this._customJobReferenceId || 'serviceId';
  }
}
