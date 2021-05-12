import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobTerraformCreatePlanEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobTerraformCreatePlanEvent')
  }
}
