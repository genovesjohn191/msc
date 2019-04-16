import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { McsApiFirewallsService } from '../services/mcs-api-firewalls.service';
import { IMcsApiFirewallsService } from '../interfaces/mcs-api-firewalls.interface';

export class McsApiFirewallsFactory extends McsApiEntityFactory<IMcsApiFirewallsService> {
  constructor() {
    super(McsApiFirewallsService);
  }
}
