import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsFirewall } from '@app/models';

export class DataChangeFirewallsEvent extends EventBusState<McsFirewall[]> {
  constructor() {
    super('DataChangeFirewallsEvent');
  }
}
