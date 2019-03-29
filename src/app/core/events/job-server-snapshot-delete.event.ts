import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobServerSnapshotDeleteEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobServerSnapshotDeleteEvent');
  }
}
