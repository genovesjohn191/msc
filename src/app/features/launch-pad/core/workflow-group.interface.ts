import { DynamicFormFieldDataBase } from '@app/features-shared/dynamic-form';
import { LaunchPadWorkflowGroupType } from './workflow-selector.service';
import { LaunchPadWorkflowType } from './workflow.interface';

export interface WorkflowSettings {
  type: LaunchPadWorkflowType;
  title: string;
  required?: boolean;
  properties: DynamicFormFieldDataBase[];
}

export interface WorkflowGroup {
  type: LaunchPadWorkflowGroupType;
  parent: WorkflowSettings;
  children: WorkflowSettings[];
}
