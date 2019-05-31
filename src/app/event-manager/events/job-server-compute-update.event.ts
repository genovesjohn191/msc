import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobServerComputeUpdateEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobServerComputeUpdateEvent');
  }
}
