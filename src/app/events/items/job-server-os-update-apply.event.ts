import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsJob } from '@app/models';

export class JobServerOsUpdateApplyEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobServerOsUpdateApplyEvent');
  }
}
