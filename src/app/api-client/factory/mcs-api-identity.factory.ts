import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { McsApiIdentityService } from '../services/mcs-api-identity.service';
import { IMcsApiIdentityService } from '../interfaces/mcs-api-identity.interface';

export class McsApiIdentityFactory extends McsApiEntityFactory<IMcsApiIdentityService> {
  constructor() {
    super(McsApiIdentityService);
  }
}
