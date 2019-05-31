import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobReceiveEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobReceiveEvent');
  }
}
