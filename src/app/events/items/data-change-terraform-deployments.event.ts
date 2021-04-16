import { EventBusState } from '@app/event-bus';
import { McsTerraformDeployment } from '@app/models';

export class DataChangeTerraformDeploymentsEvent extends EventBusState<McsTerraformDeployment[]> {
  constructor() {
    super('DataChangeTerraformDeploymentsEvent');
  }
}
