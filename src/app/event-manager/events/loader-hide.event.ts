import { EventBusState } from '@app/event-bus';

export class LoaderHideEvent extends EventBusState<void> {
  constructor() {
    super('LoaderHideEvent');
  }
}
