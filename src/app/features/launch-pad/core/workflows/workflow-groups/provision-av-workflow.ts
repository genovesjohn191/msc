import { WorkflowIdType } from '@app/models';
import {
  WorkflowGroup
} from '../workflow-group.interface';
import { provisionAvForm } from '../forms';
import { WorkflowConfig } from '../workflow.interface';

export class ProvisionAvWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowIdType.AddAntiVirus,
    title: 'Provision Anti Virus',
    form: provisionAvForm
  };
}
