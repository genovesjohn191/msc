import { WorkflowType } from '@app/models';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class ManagementToolsQueryStatusWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.ManagementToolsQueryStatus,
    title: 'Query Management Tools Status',
    form: {
      config: [],
      mapContext: null
    }
  };
}