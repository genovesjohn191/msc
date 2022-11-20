import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiUcsService } from '../interfaces/mcs-api-ucs.interface';
import { McsApiUcsService } from '../services/mcs-api-ucs.service';

export class McsApiUcsFactory extends McsApiEntityFactory<IMcsApiUcsService> {
  constructor() {
    super(McsApiUcsService);
  }
}
