import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobServerNicCreateEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobServerNicCreateEvent');
  }
}
