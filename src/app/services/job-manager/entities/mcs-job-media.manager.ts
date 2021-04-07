import { Injector } from '@angular/core';
import { EventBusDispatcherService } from '@app/event-bus';
import {
  ActionStatus,
  EntityRequester,
  McsResourceMedia
} from '@app/models';

import { McsMediaRepository } from '../../repositories/mcs-media.repository';
import { McsJobEntityBase } from '../base/mcs-job-entity.base';

export class McsJobMediaManager extends McsJobEntityBase<McsResourceMedia> {

  constructor(_actionStatus: ActionStatus, _injector: Injector) {
    super(
      EntityRequester.Media,
      _injector.get(McsMediaRepository),
      _actionStatus,
      _injector.get(EventBusDispatcherService)
    );
  }

  protected getJobReferenceId(): string {
    return 'mediaId';
  }
}
