import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { McsApiPlatformService } from '../services/mcs-api-platform.service';
import { IMcsApiPlatformService } from '../interfaces/mcs-api-platform.interface';

export class McsApiPlatformFactory extends McsApiEntityFactory<IMcsApiPlatformService> {
  constructor() {
    super(McsApiPlatformService);
  }
}
