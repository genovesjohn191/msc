import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobInProgressEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobInProgressEvent');
  }
}
