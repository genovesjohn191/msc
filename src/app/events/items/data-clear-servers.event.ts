import { EventBusState } from '@peerlancers/ngx-event-bus';

export class DataClearServersEvent extends EventBusState<void> {
  constructor() {
    super('DataClearServersEvent');
  }
}
