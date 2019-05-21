import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { McsApiInternetService } from '../services/mcs-api-internet.service';
import { IMcsApiInternetService } from '../interfaces/mcs-api-internet.interface';

export class McsApiInternetFactory extends McsApiEntityFactory<IMcsApiInternetService> {
  constructor() {
    super(McsApiInternetService);
  }
}
