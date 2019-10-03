import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsJob } from '@app/models';

export class JobServerCreateEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobServerCreateEvent');
  }
}