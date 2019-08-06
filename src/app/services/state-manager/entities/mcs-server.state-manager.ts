import { Injector } from '@angular/core';
import { McsServer } from '@app/models';
import { McsServersRepository } from '../../repositories/mcs-servers.repository';
import { McsEntityStateManagerBase } from '../base/mcs-entity-state-manager.base';

export class McsServerStateManager extends McsEntityStateManagerBase<McsServer> {

  constructor(_injector: Injector) {
    super(_injector, McsServersRepository);
  }
}
