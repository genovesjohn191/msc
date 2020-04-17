import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsJob } from '@app/models';

export class JobServerBackupServerAddEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobServerBackupServerAddEvent');
  }
}
