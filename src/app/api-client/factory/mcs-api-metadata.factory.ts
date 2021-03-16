import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiMetadataService } from '../interfaces/mcs-api-metadata.interface';
import { McsApiMetadataService } from '../services/mcs-api-metadata.service';

export class McsApiMetadataFactory extends McsApiEntityFactory<IMcsApiMetadataService> {
  constructor() {
    super(McsApiMetadataService);
  }
}
