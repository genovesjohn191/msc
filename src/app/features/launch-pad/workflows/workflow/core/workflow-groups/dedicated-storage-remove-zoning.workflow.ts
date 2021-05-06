import {
  ProductType,
  WorkflowType
} from '@app/models';
import { dedicatedStorageRemoveZoningForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class DedicatedStorageRemoveZoningWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.DedicatedStorageRemoveZoning,
    crispProductType: ProductType.PrimaryDedicatedStorage,
    title: 'Remove Dedicated Storage Zoning',
    form: dedicatedStorageRemoveZoningForm
  };
}