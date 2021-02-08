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

  DedicatedStorageAttachVolume = 200001,
  DedicatedStorageAttachVolumeCluster  = 200002,
  DedicatedStorageCreateAttachVolume  = 200003,
  DedicatedStorageCreateAttachVolumeCluster = 200004,
  DedicatedStorageIncreaseVolume  = 200005,
  DedicatedStorageRemoveZoning = 200006,
  DedicatedStorageUnmaskVolume = 200007,

  ManagementToolsQueryStatus = 300001,
  ManagementToolsAddCvm = 300002,
  ManagementToolsRemoveCvm = 300003,
}

export const workflowGroupIdText = {
  [WorkflowGroupId.VirtualDataCentreVmInstanceProvision]: 'Provision Virtual Data Centre VM Instance',

  [WorkflowGroupId.DedicatedStorageAttachVolume]: 'Attach Volume',
  [WorkflowGroupId.DedicatedStorageAttachVolumeCluster]: 'Attach Volume Cluster',
  [WorkflowGroupId.DedicatedStorageCreateAttachVolume]: 'Create and Attach Volume',
  [WorkflowGroupId.DedicatedStorageCreateAttachVolumeCluster]: 'Create and Attach Volume Cluster',
  [WorkflowGroupId.DedicatedStorageIncreaseVolume]: 'Increase Volume',
  [WorkflowGroupId.DedicatedStorageRemoveZoning]: 'Remove Zoning',
  [WorkflowGroupId.DedicatedStorageUnmaskVolume]: 'Unmask Volume',

  [WorkflowGroupId.ManagementToolsQueryStatus]: 'Query Management Tools Status',
  [WorkflowGroupId.ManagementToolsAddCvm]: 'Add To Management Tools',
  [WorkflowGroupId.ManagementToolsRemoveCvm]: 'Remove From Management Tools',
}
