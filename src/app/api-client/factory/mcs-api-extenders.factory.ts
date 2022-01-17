import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiExtendersService } from '../interfaces/mcs-api-extenders.interface';
import { McsApiExtendersService } from '../services/mcs-api-extenders.service';

export class McsApiExtendersFactory extends McsApiEntityFactory<IMcsApiExtendersService> {
  constructor() {
    super(McsApiExtendersService);
  }
}
