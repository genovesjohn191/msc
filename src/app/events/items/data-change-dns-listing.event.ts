import { McsNetworkDnsBase } from '@app/models';
import { EventBusState } from '@peerlancers/ngx-event-bus';

export class DnsListingEvent extends EventBusState<McsNetworkDnsBase[]> {
  constructor() {
    super('DnsListingEvent');
  }
}
