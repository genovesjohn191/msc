import {
  ProductType,
  WorkflowType
} from '@app/models';
import { LaunchPadForm } from './forms';

export interface WorkflowConfig {
  id: WorkflowType;
  crispProductType?: ProductType;
  title: string;
  form: LaunchPadForm;
  required?: boolean;
}

export interface WorkflowData {
  id: WorkflowType;
  serviceId?: string;
  referenceId?: string;
  propertyOverrides?: { key: string, value: any }[];
}

export interface Workflow {
  type: WorkflowType;
  title: string;
  referenceId: string;
  parentReferenceId?: string;
  serviceId?: string;
  properties: any;
  hasValueOverride?: boolean;
}
