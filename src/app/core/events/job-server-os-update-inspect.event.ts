import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobServerOsUpdateInspectEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobServerOsUpdateInspectEvent');
  }
}
