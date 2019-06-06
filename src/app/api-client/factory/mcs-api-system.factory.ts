import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { McsApiSystemService } from '../services/mcs-api-system.service';
import { IMcsApiSystemService } from '../interfaces/mcs-api-system.interface';

export class McsApiSystemFactory extends McsApiEntityFactory<IMcsApiSystemService> {
  constructor() {
    super(McsApiSystemService);
  }
}
