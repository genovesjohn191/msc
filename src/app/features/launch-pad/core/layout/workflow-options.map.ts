import { WorkflowGroupId } from '../workflows/workflow-groups/workflow-group-type.enum';

// Workflow: Add workflow group to selector options
export const workflowOptions: Map<WorkflowGroupId, string> = new Map([

  [WorkflowGroupId.VirtualDataCentreVmInstanceProvision, 'Create a new virtual data centre VM instance.'],

  [WorkflowGroupId.DedicatedStorageUnmaskVolume, 'Unmask Dedicated Storage Volume.'],
  [WorkflowGroupId.DedicatedStorageIncreaseVolume, 'Increase Dedicated Storage Volume.'],
  [WorkflowGroupId.DedicatedStorageAttachVolumeCluster, 'Attach Dedicated Storage Volume Cluster.'],
  [WorkflowGroupId.DedicatedStorageCreateAttachVolumeCluster, 'Create and Attach Dedicated Storage Volume Cluster.'],
  [WorkflowGroupId.DedicatedStorageAttachVolume, 'Attach Dedicated Storage Volume.'],
  [WorkflowGroupId.DedicatedStorageCreateAttachVolume, 'Create and Attach Dedicated Storage Volume.'],
  [WorkflowGroupId.DedicatedStorageRemoveZoning, 'Remove Dedicated Storage Zoning.'],

  [WorkflowGroupId.ManagementToolsQueryStatus, 'Query Management Tools Status.'],
  [WorkflowGroupId.ManagementToolsAddCvm, 'Add To Management Tools.'],
  [WorkflowGroupId.ManagementToolsRemoveCvm, 'Remove from Management Tools.'],
]);
