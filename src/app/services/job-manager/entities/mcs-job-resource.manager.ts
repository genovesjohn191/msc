import {
  ActionStatus,
  EntityRequester,
  McsResource
} from '@app/models';
import { Injector } from '@angular/core';
import { McsResourcesRepository } from '@app/services/repositories/mcs-resources.repository';
import { McsJobEntityBase } from '../base/mcs-job-entity.base';

export class McsJobResourceManager extends McsJobEntityBase<McsResource> {

  constructor(_actionStatus: ActionStatus, _injector: Injector, private _customJobReferenceId?: string) {
    super(EntityRequester.Resource, _injector.get(McsResourcesRepository), _actionStatus);
  }

  protected getJobReferenceId(): string {
    return this._customJobReferenceId || 'resourceId';
  }
}
