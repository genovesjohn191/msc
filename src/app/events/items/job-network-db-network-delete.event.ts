import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobNetworkDbNetworkDeleteEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobNetworkDbNetworkDeleteEvent');
  }
}
