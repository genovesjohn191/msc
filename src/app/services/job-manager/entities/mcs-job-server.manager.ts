import {
  McsServer,
  ActionStatus,
  EntityRequester
} from '@app/models';
import { Injector } from '@angular/core';
import { McsServersRepository } from '../../repositories/mcs-servers.repository';
import { McsJobEntityBase } from '../base/mcs-job-entity.base';

export class McsJobServerManager extends McsJobEntityBase<McsServer> {

  constructor(_actionStatus: ActionStatus, _injector: Injector) {
    super(EntityRequester.Server, _injector.get(McsServersRepository), _actionStatus);
  }

  protected getJobReferenceId(): string {
    return 'serverId';
  }
}
