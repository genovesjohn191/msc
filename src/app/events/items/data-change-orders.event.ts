import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsOrder } from '@app/models';

export class DataChangeOrdersEvent extends EventBusState<McsOrder[]> {
  constructor() {
    super('DataChangeOrdersEvent');
  }
}
