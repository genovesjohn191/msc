import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiPerpetualSoftwareService } from '../interfaces/mcs-api-perpetual-software.interface';
import { McsApiPerpetualSoftwareService } from '../services/mcs-api-perpetual-software.services';

export class McsApiPerpetualSoftwareFactory extends McsApiEntityFactory<IMcsApiPerpetualSoftwareService> {
  constructor() {
    super(McsApiPerpetualSoftwareService);
  }
}