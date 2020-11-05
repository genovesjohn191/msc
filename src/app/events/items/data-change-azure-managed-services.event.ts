import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsAzureService } from '@app/models';

export class DataChangeAzureManagedServicesEvent extends EventBusState<McsAzureService[]> {
  constructor() {
    super('DataChangeAzureManagedServicesEvent');
  }
}