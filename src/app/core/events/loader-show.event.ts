import { EventBusState } from '@app/event-bus';

export class LoaderShowEvent extends EventBusState<string> {
  constructor() {
    super('LoaderShowEvent');
  }
}
