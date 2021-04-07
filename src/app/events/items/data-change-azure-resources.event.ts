import { EventBusState } from '@app/event-bus';
import { McsAzureResource } from '@app/models';

export class DataChangeAzureResourcesEvent extends EventBusState<McsAzureResource[]> {
  constructor() {
    super('DataChangeAzureResourcesEvent');
  }
}
