import { Injector } from '@angular/core';
import {  McsLicense } from '@app/models';
import { McsLicensesRepository } from '@app/services/repositories/mcs-licenses.repository';
import { McsEntityStateManagerBase } from '../base/mcs-entity-state-manager.base';

export class McsLicenseStateManager extends McsEntityStateManagerBase<McsLicense> {

  constructor(_injector: Injector) {
    super(_injector, McsLicensesRepository);
  }
}
