import { EventBusState } from '@app/event-bus';

export class OrderStateEndedEvent extends EventBusState<string> {
  constructor() {
    super('OrderStateEndedEvent');
  }
}
