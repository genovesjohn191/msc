import { Injector } from '@angular/core';
import { McsBackUpAggregationTarget } from '@app/models';
import { McsBatsRepository } from '../../repositories/mcs-bats.repository';
import { McsEntityStateManagerBase } from '../base/mcs-entity-state-manager.base';

export class McsBackupAggregationTargetStateManager extends McsEntityStateManagerBase<McsBackUpAggregationTarget> {

  constructor(_injector: Injector) {
    super(_injector, McsBatsRepository);
  }
}
