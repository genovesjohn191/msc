import { EventBusState } from '@peerlancers/ngx-event-bus';

export class SessionTimedOutEvent extends EventBusState<void> {
  constructor() {
    super('SessionTimedOut');
  }
}
