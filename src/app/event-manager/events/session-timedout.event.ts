import { EventBusState } from '@app/event-bus';

export class SessionTimedOutEvent extends EventBusState<void> {
  constructor() {
    super('SessionTimedOut');
  }
}
