import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiLocationsService } from '../interfaces/mcs-api-locations.interface';
import { McsApiLocationsService } from '../services/mcs-api-locations.service';

export class McsApiLocationsFactory extends McsApiEntityFactory<IMcsApiLocationsService> {
  constructor() {
    super(McsApiLocationsService);
  }
}