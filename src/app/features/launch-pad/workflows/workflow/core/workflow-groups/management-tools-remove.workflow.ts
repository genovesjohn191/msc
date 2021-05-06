import { WorkflowType } from '@app/models';
import { standardContextMapper } from '../forms/shared/standard-context-mapper';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class ManagementToolsRemoveWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.ManagementToolsRemove,
    title: 'Remove from Management Tools',
    form: {
      config: [],
      mapContext: standardContextMapper,
    }
  };
}