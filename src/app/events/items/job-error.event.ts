import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsJob } from '@app/models';

export class JobErrorEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobErrorEvent');
  }
}
