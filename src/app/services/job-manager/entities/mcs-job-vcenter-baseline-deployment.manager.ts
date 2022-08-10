import { Injector } from '@angular/core';
import { EventBusDispatcherService } from '@app/event-bus';
import {
  ActionStatus,
  EntityRequester,
  McsVCenterBaseline
} from '@app/models';
import { McsVCenterBaselinesRepository } from '@app/services/repositories/mcs-vcenter-baselines.repository';

import { McsJobEntityBase } from '../base/mcs-job-entity.base';

export class McsJobVCenterBaselineManager extends McsJobEntityBase<McsVCenterBaseline> {

  constructor(
    _actionStatus: ActionStatus,
    _injector: Injector,
    private _customJobReferenceId?: string
  ) {
    super(
      EntityRequester.VCenterBaseline,
      _injector.get(McsVCenterBaselinesRepository),
      _actionStatus,
      _injector.get(EventBusDispatcherService)
    );
  }

  protected getJobReferenceId(): string {
    return this._customJobReferenceId || 'baselineId';
  }
}
