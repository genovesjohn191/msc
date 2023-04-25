import { EventBusState } from '@app/event-bus';
import { McsManagedSiemService } from '@app/models';

export class DataChangeManagedSiemServicesEvent extends EventBusState<McsManagedSiemService[]> {
  constructor() {
    super('DataChangeManagedSiemServicesEvent');
  }
}
