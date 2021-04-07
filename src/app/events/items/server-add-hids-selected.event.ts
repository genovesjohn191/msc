import { EventBusState } from '@app/event-bus';
import { McsServer } from '@app/models';

export class ServerAddHidsSelectedEvent extends EventBusState<McsServer> {
  constructor() {
    super('ServerAddHidsSelectedEvent');
  }
}
