import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobServerMediaAttachEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobServerMediaAttachEvent');
  }
}
