import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobServerSnapshotApplyEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobServerSnapshotApplyEvent');
  }
}
