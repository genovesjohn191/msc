import { EventBusState } from '@peerlancers/ngx-event-bus';

export class DataClearMediaEvent extends EventBusState<void> {
  constructor() {
    super('DataClearMediaEvent');
  }
}
