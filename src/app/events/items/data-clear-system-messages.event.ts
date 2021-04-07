import { EventBusState } from '@app/event-bus';

export class DataClearSystemMessageEvent extends EventBusState<void> {
  constructor() {
    super('DataClearSystemMessageEvent');
  }
}
