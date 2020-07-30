import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiAzureResourcesService } from '../interfaces/mcs-api-azure-resources.interface';
import { McsApiAzureResourcesService } from '../services/mcs-api-azure-resources.service';

export class McsApiAzureResourceFactory extends McsApiEntityFactory<IMcsApiAzureResourcesService> {
  constructor() {
    super(McsApiAzureResourcesService);
  }
}
