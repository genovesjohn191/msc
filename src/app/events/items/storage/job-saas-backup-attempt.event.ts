import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobSaasBackupAttemptEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobSaasBackupAttemptEvent');
  }
}
