import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobCurrentUserEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobCurrentUserEvent');
  }
}
