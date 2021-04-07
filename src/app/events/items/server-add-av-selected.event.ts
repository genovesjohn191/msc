import { EventBusState } from '@app/event-bus';
import { McsServer } from '@app/models';

export class ServerAddAvSelectedEvent extends EventBusState<McsServer> {
  constructor() {
    super('ServerAddAvSelectedEvent');
  }
}
