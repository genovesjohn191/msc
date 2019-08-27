import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsJob } from '@app/models';

export class JobServerResetPasswordEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobServerResetPasswordEvent');
  }
}
