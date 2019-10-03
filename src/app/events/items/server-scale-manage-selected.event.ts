import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsServer } from '@app/models';

export class ServerManagedScaleSelectedEvent extends EventBusState<McsServer> {
  constructor() {
    super('ServerManagedScaleSelectedEvent');
  }
}