import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsJob } from '@app/models';

export class JobServerHidsAddEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobServerHidsAddEvent');
  }
}
