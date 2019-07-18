import { EventBusState } from '@app/event-bus';
import { McsTicketCreate } from '@app/models';

export class TicketCreateEvent extends EventBusState<McsTicketCreate> {
  constructor() {
    super('TicketCreateEvent');
  }
}
