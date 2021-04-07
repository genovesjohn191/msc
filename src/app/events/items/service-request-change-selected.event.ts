import { EventBusState } from '@app/event-bus';
import { McsLicense } from '@app/models';

export class ServiceRequestChangeSelectedEvent extends EventBusState<McsLicense> {
  constructor() {
    super('ServiceRequestChangeSelectedEvent');
  }
}
