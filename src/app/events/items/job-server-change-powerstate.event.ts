import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobServerChangePowerStateEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobServerChangePowerStateEvent');
  }
}
