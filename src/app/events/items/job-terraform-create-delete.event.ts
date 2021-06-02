import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobTerraformCreateDeleteEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobTerraformCreateDeleteEvent')
  }
}
