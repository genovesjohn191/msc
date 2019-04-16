import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { McsApiProductsService } from '../services/mcs-api-products.service';
import { IMcsApiProductsService } from '../interfaces/mcs-api-products.interface';

export class McsApiProductsFactory extends McsApiEntityFactory<IMcsApiProductsService> {
  constructor() {
    super(McsApiProductsService);
  }
}
