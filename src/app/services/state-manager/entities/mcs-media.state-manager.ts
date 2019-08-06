import { Injector } from '@angular/core';
import { McsResourceMedia } from '@app/models';
import { McsMediaRepository } from '../../repositories/mcs-media.repository';
import { McsEntityStateManagerBase } from '../base/mcs-entity-state-manager.base';

export class McsMediaStateManager extends McsEntityStateManagerBase<McsResourceMedia> {

  constructor(_injector: Injector) {
    super(_injector, McsMediaRepository);
  }
}
