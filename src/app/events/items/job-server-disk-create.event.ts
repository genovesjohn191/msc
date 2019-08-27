import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsJob } from '@app/models';

export class JobServerDiskCreateEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobServerDiskCreateEvent');
  }
}
