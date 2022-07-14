import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobAzureExtendSpeedChangeEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobAzureExtendSpeedChangeEvent');
  }
}
