import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { McsApiOrdersService } from '../services/mcs-api-orders.service';
import { IMcsApiOrdersService } from '../interfaces/mcs-api-orders.interface';

export class McsApiOrdersFactory extends McsApiEntityFactory<IMcsApiOrdersService> {
  constructor() {
    super(McsApiOrdersService);
  }
}
