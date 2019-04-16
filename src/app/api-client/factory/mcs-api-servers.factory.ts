import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { McsApiServersService } from '../services/mcs-api-servers.service';
import { IMcsApiServersService } from '../interfaces/mcs-api-servers.interface';

export class McsApiServersFactory extends McsApiEntityFactory<IMcsApiServersService> {
  constructor() {
    super(McsApiServersService);
  }
}
