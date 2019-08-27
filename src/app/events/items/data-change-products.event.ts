import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsProduct } from '@app/models';

export class DataChangeProductsEvent extends EventBusState<McsProduct[]> {
  constructor() {
    super('DataChangeProductsEvent');
  }
}
