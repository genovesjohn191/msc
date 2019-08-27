import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsInternetPort } from '@app/models';

export class DataChangeInternetPortsEvent extends EventBusState<McsInternetPort[]> {
  constructor() {
    super('DataChangeInternetPortsEvent');
  }
}
