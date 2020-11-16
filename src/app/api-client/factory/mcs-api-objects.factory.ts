import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiObjectsService } from '../interfaces/mcs-api-objects.interface';
import { McsApiObjectsService } from '../services/mcs-api-objects.service';

export class McsApiObjectsFactory extends McsApiEntityFactory<IMcsApiObjectsService> {
  constructor() {
    super(McsApiObjectsService);
  }
}
