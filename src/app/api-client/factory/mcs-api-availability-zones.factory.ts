import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiAvailabilityZonesService } from '../interfaces/mcs-api-availability-zones.interface';
import { McsApiAvailabilityZonesService } from '../services/mcs-api-availability-zones.service';

export class McsApiAvailabilityZonesFactory extends McsApiEntityFactory<IMcsApiAvailabilityZonesService> {
  constructor() {
    super(McsApiAvailabilityZonesService);
  }
}
