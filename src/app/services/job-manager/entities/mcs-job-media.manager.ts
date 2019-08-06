import {
  McsResourceMedia,
  ActionStatus,
  EntityRequester
} from '@app/models';
import { Injector } from '@angular/core';
import { McsMediaRepository } from '../../repositories/mcs-media.repository';
import { McsJobEntityBase } from '../base/mcs-job-entity.base';

export class McsJobMediaManager extends McsJobEntityBase<McsResourceMedia> {

  constructor(_actionStatus: ActionStatus, _injector: Injector) {
    super(EntityRequester.Media, _injector.get(McsMediaRepository), _actionStatus);
  }

  protected getJobReferenceId(): string {
    return 'mediaId';
  }
}
