import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobServerDiskCreateEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobServerDiskCreateEvent');
  }
}
