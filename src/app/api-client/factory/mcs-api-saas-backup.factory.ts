import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiStorageService } from '../interfaces/mcs-api-storage.interface';
import { McsApiStorageService } from '../services/mcs-api-storage.service';

export class McsApiSaasBackupFactory extends McsApiEntityFactory<IMcsApiStorageService> {
  constructor() {
    super(McsApiStorageService);
  }
}
