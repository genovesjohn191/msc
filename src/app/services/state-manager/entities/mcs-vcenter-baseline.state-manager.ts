import { Injector } from '@angular/core';
import { McsVCenterBaseline } from '@app/models';
import { McsVCenterBaselinesRepository } from '@app/services/repositories/mcs-vcenter-baselines.repository';

import { McsEntityStateManagerBase } from '../base/mcs-entity-state-manager.base';

export class McsVCenterBaselineStateManager extends McsEntityStateManagerBase<McsVCenterBaseline> {

  constructor(_injector: Injector) {
    super(_injector, McsVCenterBaselinesRepository);
  }
}
