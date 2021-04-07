import { EventBusState } from '@app/event-bus';

export class NewRecordsRetrievedEvent extends EventBusState<void> {
  constructor() {
    super('NewRecordsRetrievedEvent');
  }
}
