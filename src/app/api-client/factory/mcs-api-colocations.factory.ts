import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiColocationsService } from '../interfaces/mcs-api-colocations.interface';
import { McsApiColocationsService } from '../services/mcs-api-colocations.service';

export class McsApiColocationsFactory extends McsApiEntityFactory<IMcsApiColocationsService> {
  constructor() {
    super(McsApiColocationsService);
  }
}
