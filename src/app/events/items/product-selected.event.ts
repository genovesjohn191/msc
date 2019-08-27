import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsProduct } from '@app/models';

export class ProductSelectedEvent extends EventBusState<McsProduct> {
  constructor() {
    super('ProductSelected');
  }
}
