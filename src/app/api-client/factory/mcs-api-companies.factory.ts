import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { McsApiCompaniesService } from '../services/mcs-api-companies.service';
import { IMcsApiCompaniesService } from '../interfaces/mcs-api-companies.interface';

export class McsApiCompaniesFactory extends McsApiEntityFactory<IMcsApiCompaniesService> {
  constructor() {
    super(McsApiCompaniesService);
  }
}
