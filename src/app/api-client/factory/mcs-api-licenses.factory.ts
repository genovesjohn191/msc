import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiLicensesService } from '../interfaces/mcs-api-licenses.interface';
import { McsApiLicensesService } from '../services/mcs-api-licenses.service';

export class McsApiLicensesFactory extends McsApiEntityFactory<IMcsApiLicensesService> {
  constructor() {
    super(McsApiLicensesService);
  }
}
