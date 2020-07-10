import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiAccountService } from '../interfaces/mcs-api-account.interface';
import { McsApiAccountService } from '../services/mcs-api-account.service';

export class McsApiAccountFactory extends McsApiEntityFactory<IMcsApiAccountService> {
  constructor() {
    super(McsApiAccountService);
  }
}
