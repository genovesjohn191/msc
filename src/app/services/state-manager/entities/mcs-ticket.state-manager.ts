import { Injector } from '@angular/core';
import {
  isNullOrEmpty,
  compareDates
} from '@app/utilities';
import { McsTicket } from '@app/models';
import { McsTicketsRepository } from '../../repositories/mcs-tickets.repository';
import { McsEntityStateManagerBase } from '../base/mcs-entity-state-manager.base';
import { IMcsEntitySortable } from '../base/mcs-entity-sortable.interface';

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
