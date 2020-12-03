import { Injector } from '@angular/core';
import {
  ActionStatus,
  EntityRequester,
  McsServer
} from '@app/models';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';

import { McsServersRepository } from '../../repositories/mcs-servers.repository';
import { McsJobEntityBase } from '../base/mcs-job-entity.base';

export class McsJobServerManager extends McsJobEntityBase<McsServer> {

  constructor(_actionStatus: ActionStatus, _injector: Injector, private _customJobReferenceId?: string) {
    super(
      EntityRequester.Server,
      _injector.get(McsServersRepository),
      _actionStatus,
      _injector.get(EventBusDispatcherService)
    );
  }

  protected getJobReferenceId(): string {
    return this._customJobReferenceId || 'serverId';
  }
}
