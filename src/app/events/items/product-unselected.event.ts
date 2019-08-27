import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsProduct } from '@app/models';

export class ProductUnSelectedEvent extends EventBusState<McsProduct> {
  constructor() {
    super('ProductUnSelected');
  }
}
