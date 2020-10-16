import { DynamicFormFieldDataBase } from '@app/features-shared/dynamic-form';
import {
  ProductType,
  WorkflowType
} from '@app/models';

export interface WorkflowConfig {
  id: WorkflowType;
  productType: ProductType;
  title: string;
  form: DynamicFormFieldDataBase[];
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
