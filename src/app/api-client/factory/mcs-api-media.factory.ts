import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { McsApiMediaService } from '../services/mcs-api-media.service';
import { IMcsApiMediaService } from '../interfaces/mcs-api-media.interface';

export class McsApiMediaFactory extends McsApiEntityFactory<IMcsApiMediaService> {
  constructor() {
    super(McsApiMediaService);
  }
}
