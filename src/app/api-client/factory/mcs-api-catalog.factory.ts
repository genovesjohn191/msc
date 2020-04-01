import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { McsApiCatalogService } from '../services/mcs-api-catalog.service';
import { IMcsApiCatalogService } from '../interfaces/mcs-api-catalog.interface';

export class McsApiCatalogFactory extends McsApiEntityFactory<IMcsApiCatalogService> {
  constructor() {
    super(McsApiCatalogService);
  }
}
