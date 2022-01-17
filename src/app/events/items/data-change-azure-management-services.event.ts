import { EventBusState } from '@app/event-bus';
import { McsAzureManagementService } from '@app/models';

export class DataChangeAzureManagementServicesEvent extends EventBusState<McsAzureManagementService[]> {
  constructor() {
    super('DataChangeAzureManagementServicesEvent');
  }
}
