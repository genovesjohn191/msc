import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobTerraformCreateDestroyEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobTerraformCreateDestroyEvent')
  }
}
