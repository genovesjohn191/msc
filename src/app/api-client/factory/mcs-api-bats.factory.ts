import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiBatsService } from '../interfaces/mcs-api-bats.interface';
import { McsApiBatsService } from '../services/mcs-api-bats.service';

export class McsApiBatsFactory extends McsApiEntityFactory<IMcsApiBatsService> {
  constructor() {
    super(McsApiBatsService);
  }
}
