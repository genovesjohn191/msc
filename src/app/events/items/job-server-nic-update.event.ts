import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobServerNicUpdateEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobServerNicUpdateEvent');
  }
}
