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
  featureFlag?: string;
  label?: string;
}

export interface WorkflowData {
  id: WorkflowType;
  serviceId?: string;
  productId?: string;
  referenceId?: string;
  propertyOverrides?: { key: string, value: any }[];
}

export interface Workflow {
  type: WorkflowType;
  title: string;
  referenceId: string;
  parentReferenceId?: string;
  serviceId?: string;
  productId?: string;
  properties: any;
  hasValueOverride?: boolean;
}
