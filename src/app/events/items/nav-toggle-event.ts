import { EventBusState } from '@app/event-bus';

export class NavToggleEvent extends EventBusState<void> {
  constructor() {
    super('NavToggleEvent');
  }
}
