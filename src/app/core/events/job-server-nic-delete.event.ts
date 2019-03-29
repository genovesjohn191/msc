import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobServerNicDeleteEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobServerNicDeleteEvent');
  }
}
