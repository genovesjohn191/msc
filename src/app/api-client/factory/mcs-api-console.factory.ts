import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { McsApiConsoleService } from '../services/mcs-api-console.service';
import { IMcsApiConsoleService } from '../interfaces/mcs-api-console.interface';

export class McsApiConsoleFactory extends McsApiEntityFactory<IMcsApiConsoleService> {
  constructor() {
    super(McsApiConsoleService);
  }
}
