import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobServerManagedScaleEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobServerManagedScaleEvent');
  }
}
