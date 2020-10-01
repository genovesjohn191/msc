import { WorkflowGroupId } from './workflow-groups/workflow-group-type.enum';
import { WorkflowConfig } from './workflow.interface';

export interface WorkflowGroupConfig {
  id: WorkflowGroupId;
  serviceId?: string;
  parentServiceId?: string;
  referenceId?: string;
  properties?: { key: string, value: any }[];
}

export interface WorkflowGroup {
  parent: WorkflowConfig;
  children?: WorkflowConfig[];
}
