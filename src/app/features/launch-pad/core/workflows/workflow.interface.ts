import { DynamicFormFieldDataBase } from '@app/features-shared/dynamic-form';
import { WorkflowIdType } from '@app/models';

export interface WorkflowConfig {
  id: WorkflowIdType;
  title: string;
  required?: boolean;
  form: DynamicFormFieldDataBase[];
}

export interface Workflow {
  type: WorkflowIdType;
  referenceId: string;
  parentReferenceId?: string;
  serviceId?: string;
  parentServiceId?: string;
  properties: any[];
}
