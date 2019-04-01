import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobErrorEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobErrorEvent');
  }
}
