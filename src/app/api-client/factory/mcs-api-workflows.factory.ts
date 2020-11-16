import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiWorkflowsService } from '../interfaces/mcs-api-workflows.interface';
import { McsApiWorkflowsService } from '../services/mcs-api-workflows.services';

export class McsApiWorkflowsFactory extends McsApiEntityFactory<IMcsApiWorkflowsService> {
  constructor() {
    super(McsApiWorkflowsService);
  }
}
