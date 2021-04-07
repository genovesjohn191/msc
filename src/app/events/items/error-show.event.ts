import { EventBusState } from '@app/event-bus';

export class ErrorShowEvent extends EventBusState<string> {
  constructor() {
    super('ErrorShowEvent');
  }
}
