import { ProductType, WorkflowType } from '@app/models';
import {
  WorkflowGroup
} from '../workflow-group.interface';
import { provisionAvForm } from '../forms';
import { WorkflowConfig } from '../workflow.interface';

export class ProvisionAvWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.AddAntiVirus,
    productType: ProductType.ServerAntiVirus,
    title: 'Provision Anti Virus',
    form: provisionAvForm
  };
}
