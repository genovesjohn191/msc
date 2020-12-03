import { Injector } from '@angular/core';
import {
  ActionStatus,
  EntityRequester,
  McsLicense
} from '@app/models';
import { McsLicensesRepository } from '@app/services/repositories/mcs-licenses.repository';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';

import { McsJobEntityBase } from '../base/mcs-job-entity.base';

export class McsJobLicenseManager extends McsJobEntityBase<McsLicense> {

  constructor(_actionStatus: ActionStatus, _injector: Injector, private _customJobReferenceId?: string) {
    super(
      EntityRequester.License,
      _injector.get(McsLicensesRepository),
      _actionStatus,
      _injector.get(EventBusDispatcherService)
    );
  }

  protected getJobReferenceId(): string {
    return this._customJobReferenceId || 'serviceId';
  }
}
