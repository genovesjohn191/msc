import {
  ProductType,
  WorkflowType
} from '@app/models';
import { dedicatedStorageAttachVolumeClusterForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class DedicatedStorageAttachVolumeClusterWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.DedicatedStorageAttachVolumeCluster,
    crispProductType: ProductType.PrimaryDedicatedStorage,
    title: 'Attach Dedicated Storage Volume Cluster',
    form: dedicatedStorageAttachVolumeClusterForm
  };
}