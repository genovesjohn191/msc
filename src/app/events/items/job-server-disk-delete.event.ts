import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsJob } from '@app/models';

export class JobServerDiskDeleteEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobServerDiskDeleteEvent');
  }
}
