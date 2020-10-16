import { WorkflowGroupId } from './workflow-groups/workflow-group-type.enum';
import {
  Workflow,
  WorkflowConfig,
  WorkflowData
} from './workflow.interface';

export interface WorkflowGroupConfig {
  id: WorkflowGroupId;
  parent: WorkflowData;
  children: WorkflowData[];
}

export interface WorkflowGroup {
  parent: WorkflowConfig;
  children?: WorkflowConfig[];
}

export interface WorkflowGroupSaveState {
  config: WorkflowGroupConfig;
  workflows: Workflow[];
}
