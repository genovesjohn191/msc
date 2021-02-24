import { McsNetworkDnsSummary } from '@app/models';
import { EventBusState } from '@peerlancers/ngx-event-bus';

export class DnsDetailsChangeEvent extends EventBusState<McsNetworkDnsSummary> {
  constructor() {
    super('DnsDetailsChangeEvent');
  }
}
