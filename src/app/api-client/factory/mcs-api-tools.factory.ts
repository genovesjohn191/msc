import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { McsApiToolsService } from '../services/mcs-api-tools.service';
import { IMcsApiToolsService } from '../interfaces/mcs-api-tools.interface';

export class McsApiToolsFactory extends McsApiEntityFactory<IMcsApiToolsService> {
  constructor() {
    super(McsApiToolsService);
  }
}
