import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { McsApiJobsService } from '../services/mcs-api-jobs.service';
import { IMcsApiJobsService } from '../interfaces/mcs-api-jobs.interface';

export class McsApiJobsFactory extends McsApiEntityFactory<IMcsApiJobsService> {
  constructor() {
    super(McsApiJobsService);
  }
}
