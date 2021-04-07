import { EventBusState } from '@app/event-bus';

export class DataClearMediaEvent extends EventBusState<void> {
  constructor() {
    super('DataClearMediaEvent');
  }
}
