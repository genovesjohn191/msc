import { EventBusState } from '@peerlancers/ngx-event-bus';

export class NavToggleEvent extends EventBusState<void> {
  constructor() {
    super('NavToggleEvent');
  }
}
