import { EventBusState } from '@app/event-bus';
import { McsNetworkDnsSummary } from '@app/models';

export class DnsDetailsChangeEvent extends EventBusState<McsNetworkDnsSummary> {
  constructor() {
    super('DnsDetailsChangeEvent');
  }
}
