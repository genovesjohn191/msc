import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsJob } from '@app/models';

export class JobServerMediaDetachEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobServerMediaDetachEvent');
  }
}
