import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiAzureResourceService } from '../interfaces/mcs-api-azure-resource.interface';
import { McsApiAzureResourceService } from '../services/mcs-api-azure-resource.service';

export class McsApiAzureResourceFactory extends McsApiEntityFactory<IMcsApiAzureResourceService> {
  constructor() {
    super(McsApiAzureResourceService);
  }
}
