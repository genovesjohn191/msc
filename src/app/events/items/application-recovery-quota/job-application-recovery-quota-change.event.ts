import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobApplicationRecoveryQuotaChangeEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobApplicationRecoveryQuotaChangeEvent');
  }
}
