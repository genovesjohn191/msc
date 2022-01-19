import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiAzureManagementServicesService } from '../interfaces/mcs-api-azure-management-services.interface';
import { McsApiAzureManagementServicesService } from '../services/mcs-api-azure-management-services.service';

export class McsApiAzureManagementServicesFactory extends McsApiEntityFactory<IMcsApiAzureManagementServicesService> {
  constructor() {
    super(McsApiAzureManagementServicesService);
  }
}
