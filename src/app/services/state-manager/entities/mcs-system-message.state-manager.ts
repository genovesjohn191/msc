import { Injector } from '@angular/core';
import { McsSystemMessage } from '@app/models';
import { McsSystemMessagesRepository } from '../../repositories/mcs-system-messages.repository';
import { McsEntityStateManagerBase } from '../base/mcs-entity-state-manager.base';
import { IMcsEntitySortable } from '../base/mcs-entity-sortable.interface';

export class McsSystemMessageStateManager extends McsEntityStateManagerBase<McsSystemMessage>
  implements IMcsEntitySortable {

  constructor(_injector: Injector) {
    super(_injector, McsSystemMessagesRepository);
  }

  public sortEntityRecords(): void {
    /**
     * TODO: Update the method to be used in implementing the changes
     * on enabled field of system messages
     */
    this.refreshDataCache();
  }
}
