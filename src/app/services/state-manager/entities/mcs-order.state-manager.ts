import { Injector } from '@angular/core';
import { McsOrder } from '@app/models';
import {
  isNullOrEmpty,
  compareDates
} from '@app/utilities';
import { McsOrdersRepository } from '../../repositories/mcs-orders.repository';
import { McsEntityStateManagerBase } from '../base/mcs-entity-state-manager.base';
import { IMcsEntitySortable } from '../base/mcs-entity-sortable.interface';

export class McsOrderStateManager extends McsEntityStateManagerBase<McsOrder> implements IMcsEntitySortable {

  constructor(_injector: Injector) {
    super(_injector, McsOrdersRepository);
  }

  public sortEntityRecords(): void {
    if (isNullOrEmpty(this.entityRepository)) { return; }
    let sortPredicate = (firstRecord: McsOrder, secondRecord: McsOrder) => {
      return compareDates(secondRecord.modifiedOn, firstRecord.modifiedOn);
    };
    this.entityRepository.sortRecords(sortPredicate);
  }
}
