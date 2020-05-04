import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsServer } from '@app/models';

export class ServerAddBackupVmSelectedEvent extends EventBusState<McsServer> {
  constructor() {
    super('ServerAddBackupVmSelectedEvent');
  }
}
