import { EventBusState } from '@peerlancers/ngx-event-bus';

export class ErrorShowEvent extends EventBusState<string> {
  constructor() {
    super('ErrorShowEvent');
  }
}
