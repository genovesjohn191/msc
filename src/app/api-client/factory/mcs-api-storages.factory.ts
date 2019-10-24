import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiStoragesService } from '../interfaces/mcs-api-storages.interface';
import { McsApiStoragesService } from '../services/mcs-api-storages.service';

export class McsApiStoragesFactory extends McsApiEntityFactory<IMcsApiStoragesService> {
  constructor() {
    super(McsApiStoragesService);
  }
}
