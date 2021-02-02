// Workflow: Add new workflow group ID here
/**
 * Standardisation Note: WorkflowGroupId numeric value should always be 6 digits
 * first 3 represents the product type
 * last 3 represents the action
 *
 * Changing the numeric value will cause save states to not load properly
 */
export enum WorkflowGroupId {
  VirtualDataCentreVmInstanceProvision = 100001,
  VirtualDataCentreVmInstanceAddToManagementTools = 100002,
  VirtualDataCentreVmInstanceRemoveFromManagementTools = 100003,

  DedicatedStorageAttachVolume = 200001,
  DedicatedStorageAttachVolumeCluster  = 200002,
  DedicatedStorageCreateAttachVolume  = 200003,
  DedicatedStorageCreateAttachVolumeCluster = 200004,
  DedicatedStorageIncreaseVolume  = 200005,
  DedicatedStorageRemoveZoning = 200006,
  DedicatedStorageUnmaskVolume = 200007
}

export const workflowGroupIdText = {
  [WorkflowGroupId.VirtualDataCentreVmInstanceProvision]: 'Provision Virtual Data Centre VM Instance',
  [WorkflowGroupId.VirtualDataCentreVmInstanceAddToManagementTools]: 'Add CVM To Management Tools',
  [WorkflowGroupId.VirtualDataCentreVmInstanceRemoveFromManagementTools]: 'Remove CVM From Management Tools',

  [WorkflowGroupId.DedicatedStorageAttachVolume]: 'Attach Volume',
  [WorkflowGroupId.DedicatedStorageAttachVolumeCluster]: 'Attach Volume Cluster',
  [WorkflowGroupId.DedicatedStorageCreateAttachVolume]: 'Create and Attach Volume',
  [WorkflowGroupId.DedicatedStorageCreateAttachVolumeCluster]: 'Create and Attach Volume Cluster',
  [WorkflowGroupId.DedicatedStorageIncreaseVolume]: 'Increase Volume',
  [WorkflowGroupId.DedicatedStorageRemoveZoning]: 'Remove Zoning',
  [WorkflowGroupId.DedicatedStorageUnmaskVolume]: 'Unmask Volume'
}
