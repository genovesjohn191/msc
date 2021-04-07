import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobSuccessfulEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobSuccessfulEvent');
  }
}
