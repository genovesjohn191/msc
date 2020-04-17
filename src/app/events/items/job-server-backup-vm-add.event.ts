import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsJob } from '@app/models';

export class JobServerBackupVmAddEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobServerBackupVmAddEvent');
  }
}
