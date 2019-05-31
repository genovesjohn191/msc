import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobServerRenameEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobServerRenameEvent');
  }
}
