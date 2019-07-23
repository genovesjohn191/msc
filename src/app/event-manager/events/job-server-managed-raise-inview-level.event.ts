import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobServerManagedRaiseInviewLevelEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobServerManagedRaiseInviewLevelEvent');
  }
}
