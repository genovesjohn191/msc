import { EventBusState } from '@peerlancers/ngx-event-bus';

export class DataClearSystemMessageEvent extends EventBusState<void> {
  constructor() {
    super('DataClearSystemMessageEvent');
  }
}
