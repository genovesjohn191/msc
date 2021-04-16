import { EventBusState } from '@app/event-bus';

export class DataClearTerraformDeploymentsEvent extends EventBusState<void> {
  constructor() {
    super('DataClearTerraformDeploymentsEvent');
  }
}
