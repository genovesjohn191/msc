import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { McsApiVcloudInstanceService } from '../services/mcs-api-vcloud-instance.service';
import { IMcsApiVcloudInstanceService } from '../interfaces/mcs-api-vcloud-instance.interface';

export class McsApiVcloudInstanceFactory extends McsApiEntityFactory<IMcsApiVcloudInstanceService> {
  constructor() {
    super(McsApiVcloudInstanceService);
  }
}