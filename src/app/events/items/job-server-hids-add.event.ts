import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobServerHidsAddEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobServerHidsAddEvent');
  }
}
