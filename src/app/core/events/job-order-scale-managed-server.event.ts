import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobOrderScaleManagedServerEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobOrderScaleManagedServerEvent');
  }
}
