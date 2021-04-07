import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobBackupAggregationTargetAddEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobBackupAggregationTargetAddEvent');
  }
}
