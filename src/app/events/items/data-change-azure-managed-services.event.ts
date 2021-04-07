import { EventBusState } from '@app/event-bus';
import { McsAzureService } from '@app/models';

export class DataChangeAzureManagedServicesEvent extends EventBusState<McsAzureService[]> {
  constructor() {
    super('DataChangeAzureManagedServicesEvent');
  }
}