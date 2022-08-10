import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobVCenterBaselineRemediateEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobVCenterBaselineRemediateEvent');
  }
}
