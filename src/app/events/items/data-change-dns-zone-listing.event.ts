import { EventBusState } from '@app/event-bus';
import { McsNetworkDnsZoneBase } from '@app/models';

export class DnsZoneListingEvent extends EventBusState<McsNetworkDnsZoneBase[]> {
  constructor() {
    super('DnsZoneListingEvent');
  }
}
