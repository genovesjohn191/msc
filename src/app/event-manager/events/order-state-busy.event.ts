import { EventBusState } from '@app/event-bus';

export class OrderStateBusyEvent extends EventBusState<string> {
  constructor() {
    super('OrderStateBusyEvent');
  }
}
