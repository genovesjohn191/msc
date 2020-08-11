import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiNetworkDnsService } from '../interfaces/mcs-api-network-dns.interface';
import { McsApiNetworkDnsService } from '../services/mcs-api-network-dns.service';

export class McsApiNetworkDnsFactory extends McsApiEntityFactory<IMcsApiNetworkDnsService> {
  constructor() {
    super(McsApiNetworkDnsService);
  }
}
