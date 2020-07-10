import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiSubscriptionsService } from '../interfaces/mcs-api-subscriptions.interface';
import { McsApiSubscriptionsService } from '../services/mcs-api-subscriptions.service';

export class McsApiSubscriptionsFactory extends McsApiEntityFactory<IMcsApiSubscriptionsService> {
  constructor() {
    super(McsApiSubscriptionsService);
  }
}
