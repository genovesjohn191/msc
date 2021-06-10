import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiNetworkDbService } from '../interfaces/mcs-api-network-db.interface';
import { McsApiNetworkDbService } from '../services/mcs-api-network-db.service';

export class McsApiNetworkDbFactory extends McsApiEntityFactory<IMcsApiNetworkDbService> {
  constructor() {
    super(McsApiNetworkDbService);
  }
}
