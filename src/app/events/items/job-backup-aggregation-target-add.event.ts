import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsJob } from '@app/models';

export class JobBackupAggregationTargetAddEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobBackupAggregationTargetAddEvent');
  }
}
