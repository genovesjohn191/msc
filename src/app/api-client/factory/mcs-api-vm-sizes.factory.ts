import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiVmSizesService } from '../interfaces/mcs-api-vm-sizes.interface';
import { McsApiVMSizesService } from '../services/mcs-api-vm-sizes.service';

export class McsApiVmSizesFactory extends McsApiEntityFactory<IMcsApiVmSizesService> {
  constructor() {
    super(McsApiVMSizesService);
  }
}