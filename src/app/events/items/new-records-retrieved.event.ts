import { EventBusState } from '@peerlancers/ngx-event-bus';

export class NewRecordsRetrievedEvent extends EventBusState<void> {
  constructor() {
    super('NewRecordsRetrievedEvent');
  }
}
