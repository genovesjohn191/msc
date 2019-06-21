import { EventBusState } from '@app/event-bus';
import { McsOrder } from '@app/models';

export class DataChangeOrdersEvent extends EventBusState<McsOrder[]> {
  constructor() {
    super('DataChangeOrdersEvent');
  }
}
