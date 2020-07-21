import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiReportsService } from '../interfaces/mcs-api-reports.interface';
import { McsApiReportsService } from '../services/mcs-api-reports.service';

export class McsApiReportsFactory extends McsApiEntityFactory<IMcsApiReportsService> {
  constructor() {
    super(McsApiReportsService);
  }
}
