import { EventBusState } from '@app/event-bus';
import { McsProduct } from '@app/models';

export class ProductSelectedEvent extends EventBusState<McsProduct> {
  constructor() {
    super('ProductSelected');
  }
}
