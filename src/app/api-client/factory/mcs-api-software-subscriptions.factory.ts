import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiAzureSoftwareSubscriptionsService } from '../interfaces/mcs-api-software-subscriptions.interface';
import { McsApiAzureSoftwareSubscriptionsService } from '../services/mcs-api-azure-software-subscriptions.service';

export class McsApiAzureSoftwareSubscriptionsFactory extends McsApiEntityFactory<IMcsApiAzureSoftwareSubscriptionsService> {
  constructor() {
    super(McsApiAzureSoftwareSubscriptionsService);
  }
}