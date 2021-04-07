import { EventBusState } from '@app/event-bus';
import { McsNetworkDnsBase } from '@app/models';

export class DnsListingEvent extends EventBusState<McsNetworkDnsBase[]> {
  constructor() {
    super('DnsListingEvent');
  }
}
