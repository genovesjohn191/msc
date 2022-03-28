import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiPlannedWorkService } from '../interfaces/mcs-api-planned-work.interface';
import { McsApiPlannedWorkService } from '../services/mcs-api-planned-work.service';

export class McsApiPlannedWorkFactory extends McsApiEntityFactory<IMcsApiPlannedWorkService> {
  constructor() {
    super(McsApiPlannedWorkService);
  }
}