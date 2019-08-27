import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsJob } from '@app/models';

export class JobServerSnapshotCreateEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobServerSnapshotCreateEvent');
  }
}
