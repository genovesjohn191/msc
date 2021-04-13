import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiTerraformService } from '../interfaces/mcs-api-terraform.interface';
import { McsApiTerraformService } from '../services/mcs-api-terraform.service';

export class McsApiTerraformFactory extends McsApiEntityFactory<IMcsApiTerraformService> {
  constructor() {
    super(McsApiTerraformService);
  }
}
