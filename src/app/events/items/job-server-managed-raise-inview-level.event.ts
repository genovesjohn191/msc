import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsJob } from '@app/models';

export class JobServerManagedRaiseInviewLevelEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobServerManagedRaiseInviewLevelEvent');
  }
}
