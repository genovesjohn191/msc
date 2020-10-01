import { WorkflowIdType } from '@app/models';
import {
  WorkflowGroup
} from '../workflow-group.interface';
import { changeVmForm } from '../forms';
import { WorkflowConfig } from '../workflow.interface';

export class ChangeVmWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowIdType.ChangeVm,
    title: 'Change Virtual Machine',
    form: changeVmForm
  };
}
