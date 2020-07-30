import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiAzureServicesService } from '../interfaces/mcs-api-azure-services.interface';
import { McsApiAzureServicesService } from '../services/mcs-api-azure-services.service';

export class McsApiAzureServicesFactory extends McsApiEntityFactory<IMcsApiAzureServicesService> {
  constructor() {
    super(McsApiAzureServicesService);
  }
}
