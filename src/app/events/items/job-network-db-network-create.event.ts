import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobNetworkDbNetworkCreateEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobNetworkDbNetworkCreateEvent');
  }
}
