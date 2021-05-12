import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobTerraformCreateApplyEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobTerraformCreateApplyEvent')
  }
}
