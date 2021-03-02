import { Injector } from '@angular/core';
import { McsSystemMessage } from '@app/models';

import { McsSystemMessagesRepository } from '../../repositories/mcs-system-messages.repository';
import { McsEntityStateManagerBase } from '../base/mcs-entity-state-manager.base';

export class McsSystemMessageStateManager extends McsEntityStateManagerBase<McsSystemMessage> {

  constructor(_injector: Injector) {
    super(_injector, McsSystemMessagesRepository);
  }
}
