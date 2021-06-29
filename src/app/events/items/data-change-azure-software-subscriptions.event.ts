import { EventBusState } from '@app/event-bus';
import { McsAzureSoftwareSubscription } from '@app/models';

export class DataChangeAzureSoftwareSubscriptionsEvent extends EventBusState<McsAzureSoftwareSubscription[]> {
  constructor() {
    super('DataChangeAzureSoftwareSubscriptionsEvent');
  }
}