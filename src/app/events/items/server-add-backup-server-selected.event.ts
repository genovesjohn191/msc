import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsServer } from '@app/models';

export class ServerAddBackupServerSelectedEvent extends EventBusState<McsServer> {
  constructor() {
    super('ServerAddBackupServerSelectedEvent');
  }
}
