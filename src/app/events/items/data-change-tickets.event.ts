import { EventBusState } from '@app/event-bus';
import { McsTicket } from '@app/models';

export class DataChangeTicketsEvent extends EventBusState<McsTicket[]> {
  constructor() {
    super('DataChangeTicketsEvent');
  }
}
