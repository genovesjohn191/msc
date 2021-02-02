import { ProductType } from '@app/models';
import { WorkflowGroupId } from './workflow-groups/workflow-group-type.enum';

// Workflow: Assign workflow groups to product types
export const productWorkflowGroupMap: Map<ProductType, number[]> = new Map([
  [ ProductType.VirtualDataCentreVmInstance,
    [
      WorkflowGroupId.VirtualDataCentreVmInstanceProvision,
      WorkflowGroupId.VirtualDataCentreVmInstanceAddToManagementTools,
      WorkflowGroupId.VirtualDataCentreVmInstanceRemoveFromManagementTools
    ]],

  [ ProductType.PrimaryDedicatedStorage,
    [
      WorkflowGroupId.DedicatedStorageAttachVolume,
      WorkflowGroupId.DedicatedStorageAttachVolumeCluster,
      WorkflowGroupId.DedicatedStorageCreateAttachVolume,
      WorkflowGroupId.DedicatedStorageCreateAttachVolumeCluster,
      WorkflowGroupId.DedicatedStorageIncreaseVolume,
      WorkflowGroupId.DedicatedStorageRemoveZoning,
      WorkflowGroupId.DedicatedStorageUnmaskVolume,
    ]]
]);
