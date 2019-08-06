import { Injector } from '@angular/core';
import { McsSystemMessage } from '@app/models';
import {
  isNullOrEmpty,
  compareDates
} from '@app/utilities';
import { McsSystemMessagesRepository } from '../../repositories/mcs-system-messages.repository';
import { McsEntityStateManagerBase } from '../base/mcs-entity-state-manager.base';
import { IMcsEntitySortable } from '../base/mcs-entity-sortable.interface';

export class McsSystemMessageStateManager extends McsEntityStateManagerBase<McsSystemMessage>
  implements IMcsEntitySortable {

  constructor(_injector: Injector) {
    super(_injector, McsSystemMessagesRepository);
  }

  public sortEntityRecords(): void {
    if (isNullOrEmpty(this.entityRepository)) { return; }
    let sortPredicate = (firstRecord: McsSystemMessage, secondRecord: McsSystemMessage) => {
      return compareDates(secondRecord.updatedOn, firstRecord.updatedOn);
    };
    this.entityRepository.sortRecords(sortPredicate);
  }
}
