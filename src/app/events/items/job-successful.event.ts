import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsJob } from '@app/models';

export class JobSuccessfulEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobSuccessfulEvent');
  }
}
