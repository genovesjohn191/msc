import { EventBusState } from '@app/event-bus';

export class DataClearServersEvent extends EventBusState<void> {
  constructor() {
    super('DataClearServersEvent');
  }
}
