import { ProductType, WorkflowType } from '@app/models';
import { dedicatedStorageCreateAndAttachVolumeClusterForm } from '../forms/dedicated-storage-create-attach-volume-cluster.form';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class DedicatedStorageCreateAndAttachVolumeClusterWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.DedicatedStorageCreateAttachVolumeCluster,
    crispProductType: ProductType.PrimaryDedicatedStorage,
    title: 'Create And Attach Dedicated Storage Volume Cluster',
    form: dedicatedStorageCreateAndAttachVolumeClusterForm
  };
}