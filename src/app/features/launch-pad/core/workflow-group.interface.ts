import { DynamicFormFieldDataBase } from '@app/features-shared/dynamic-form';
import { LaunchPadWorkflowType } from './workflow.interface';

export type LaunchPadWorkflowGroupType =
    'new-cvm'
  | 'old-cvm';

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
