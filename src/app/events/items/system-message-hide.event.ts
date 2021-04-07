import { EventBusState } from '@app/event-bus';

export class SystemMessageHideEvent extends EventBusState<void> {
  constructor() {
    super('SystemMessageHideEvent');
  }
}
