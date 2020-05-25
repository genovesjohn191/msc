import {
  ActionStatus,
  EntityRequester,
  McsLicense
} from '@app/models';
import { Injector } from '@angular/core';
import { McsJobEntityBase } from '../base/mcs-job-entity.base';
import { McsLicensesRepository } from '@app/services/repositories/mcs-licenses.repository';

export class McsJobLicenseManager extends McsJobEntityBase<McsLicense> {

  constructor(_actionStatus: ActionStatus, _injector: Injector, private _customJobReferenceId?: string) {
    super(EntityRequester.License, _injector.get(McsLicensesRepository), _actionStatus);
  }

  protected getJobReferenceId(): string {
    return this._customJobReferenceId || 'serviceId';
  }
}
