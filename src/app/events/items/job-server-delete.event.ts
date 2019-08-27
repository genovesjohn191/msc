import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsJob } from '@app/models';

export class JobServerDeleteEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobServerDeleteEvent');
  }
}
