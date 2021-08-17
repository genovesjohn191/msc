import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiAuthService } from '../interfaces/mcs-api-auth.interface';
import { McsApiAuthService } from '../services/mcs-api-auth.service';

export class McsApiAuthFactory extends McsApiEntityFactory<IMcsApiAuthService> {
  constructor() {
    super(McsApiAuthService);
  }
}
