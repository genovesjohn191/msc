import { Injector } from '@angular/core';
import { McsSaasBackupRepository } from '@app/services/repositories/mcs-saas-backup.repository';

import { McsEntityStateManagerBase } from '../base/mcs-entity-state-manager.base';

export class McsSaasBackupStateManager extends McsEntityStateManagerBase<any> {

  constructor(_injector: Injector) {
    super(_injector, McsSaasBackupRepository);
  }
}
