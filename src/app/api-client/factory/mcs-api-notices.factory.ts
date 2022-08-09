import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiNoticesService } from '../interfaces/mcs-api-notices.interface';
import { McsApiNoticesService } from '../services/mcs-api-notices.service';

export class McsApiNoticesFactory extends McsApiEntityFactory<IMcsApiNoticesService> {
  constructor() {
    super(McsApiNoticesService);
  }
}
