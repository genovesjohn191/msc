import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobServerCloneEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobServerCloneEvent');
  }
}
