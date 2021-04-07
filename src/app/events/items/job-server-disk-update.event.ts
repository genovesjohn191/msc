import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobServerDiskUpdateEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobServerDiskUpdateEvent');
  }
}
