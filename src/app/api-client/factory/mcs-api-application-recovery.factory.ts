import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiApplicationRecoveryService } from '../interfaces/mcs-api-application-recovery.interface';
import { McsApiApplicationRecoveryService } from '../services/mcs-api-application-recovery.service';

export class McsApiApplicationRecoveryFactory extends McsApiEntityFactory<IMcsApiApplicationRecoveryService> {
  constructor() {
    super(McsApiApplicationRecoveryService);
  }
}
