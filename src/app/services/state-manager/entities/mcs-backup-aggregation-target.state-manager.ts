import { Injector } from '@angular/core';
import { McsBackUpAggregationTarget } from '@app/models';
import { McsBackupAggregationTargetsRepository } from '../../repositories/mcs-backup-aggregation-targets.repository';
import { McsEntityStateManagerBase } from '../base/mcs-entity-state-manager.base';

export class McsBackupAggregationTargetStateManager extends McsEntityStateManagerBase<McsBackUpAggregationTarget> {

  constructor(_injector: Injector) {
    super(_injector, McsBackupAggregationTargetsRepository);
  }
}
