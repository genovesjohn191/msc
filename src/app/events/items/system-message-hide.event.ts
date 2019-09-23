import { EventBusState } from '@peerlancers/ngx-event-bus';

export class SystemMessageHideEvent extends EventBusState<void> {
  constructor() {
    super('SystemMessageHideEvent');
  }
}
