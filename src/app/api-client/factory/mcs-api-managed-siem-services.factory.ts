import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiManagedSiemService } from '../interfaces/mcs-api-managed-siem-services.interface';
import { McsApiManagedSiemService } from '../services/mcs-api-managed-siem-services.service';

export class McsApiManagedSiemServicesFactory extends McsApiEntityFactory<IMcsApiManagedSiemService> {
  constructor() {
    super(McsApiManagedSiemService);
  }
}
