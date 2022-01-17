import { EventBusState } from '@app/event-bus';
import { McsApplicationRecovery } from '@app/models';

export class DataChangeApplicationRecoveryEvent extends EventBusState<McsApplicationRecovery[]> {
  constructor() {
    super('DataChangeApplicationRecoveryEvent');
  }
}
