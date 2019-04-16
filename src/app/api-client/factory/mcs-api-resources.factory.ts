import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { McsApiResourcesService } from '../services/mcs-api-resources.service';
import { IMcsApiResourcesService } from '../interfaces/mcs-api-resources.interface';

export class McsApiResourcesFactory extends McsApiEntityFactory<IMcsApiResourcesService> {
  constructor() {
    super(McsApiResourcesService);
  }
}
