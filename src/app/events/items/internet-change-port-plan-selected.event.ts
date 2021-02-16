import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsInternetPort } from '@app/models';

export class InternetChangePortPlanSelectedEvent extends EventBusState<McsInternetPort> {
  constructor() {
    super('InternetChangePortPlanSelectedEvent');
  }
}