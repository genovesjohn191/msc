import { Injector } from '@angular/core';
import { McsTicket } from '@app/models';
import {
  compareDates,
  isNullOrEmpty
} from '@app/utilities';

import { McsTicketsRepository } from '../../repositories/mcs-tickets.repository';
import { IMcsEntitySortable } from '../base/mcs-entity-sortable.interface';
import { McsEntityStateManagerBase } from '../base/mcs-entity-state-manager.base';

export class McsTicketStateManager extends McsEntityStateManagerBase<McsTicket> implements IMcsEntitySortable {

  constructor(_injector: Injector) {
    super(_injector, McsTicketsRepository);
  }

  public sortEntityRecords(): void {
    if (isNullOrEmpty(this.entityRepository)) { return; }

    let sortPredicate = (firstRecord: McsTicket, secondRecord: McsTicket) => {
      return compareDates(secondRecord.updatedOn, firstRecord.updatedOn);
    };
    this.entityRepository.sortRecords(sortPredicate);
  }
}
