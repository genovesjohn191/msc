import { IMcsApiVCenterService } from '../interfaces/mcs-api-vcenter.interface';
import { McsApiVCenterService } from '../services/mcs-api-vcenter.service';
import { McsApiEntityFactory } from './mcs-api-entity.factory';

export class McsApiVCenterFactory extends McsApiEntityFactory<IMcsApiVCenterService> {
  constructor() {
    super(McsApiVCenterService);
  }
}
