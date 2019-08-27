import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsServer } from '@app/models';

export class ServerManagedRaiseInviewSelectedEvent extends EventBusState<McsServer> {
  constructor() {
    super('ServerManagedRaiseInviewSelectedEvent');
  }
}
