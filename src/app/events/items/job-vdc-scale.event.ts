import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobVdcScaleEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobVdcScaleEvent');
  }
}
