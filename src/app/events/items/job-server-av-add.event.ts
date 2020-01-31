import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsJob } from '@app/models';

export class JobServerAvAddEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobServerAvAddEvent');
  }
}
