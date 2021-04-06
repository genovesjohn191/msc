import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiTenantsService } from '../interfaces/mcs-api-tenants.interface';
import { McsApiTenantsService } from '../services/mcs-api-tenants.service';

export class McsApiTenantsFactory extends McsApiEntityFactory<IMcsApiTenantsService> {
  constructor() {
    super(McsApiTenantsService);
  }
}
