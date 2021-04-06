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
  VirtualDataCentreVmInstanceProvisionComplex = 100002,

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
  ManagementToolsRename = 300004,

  HostSecurityProvisionAntiVirus = 4000000,
  HostSecurityProvisionHids = 4000001,

  ServerBackupProvision = 5000000,

  VmBackupProvision = 6000000,

  MicrosoftCreateSubscription = 7000000,
}

export const workflowGroupIdText = {
  [WorkflowGroupId.VirtualDataCentreVmInstanceProvision]: 'Provision Virtual Data Centre VM Instance',
  [WorkflowGroupId.VirtualDataCentreVmInstanceProvisionComplex]: 'Provision Virtual Data Centre VM Instance+',

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
  [WorkflowGroupId.ManagementToolsRename]: 'Rename In Management Tools',

  [WorkflowGroupId.HostSecurityProvisionAntiVirus]: 'Provision Anti-Virus',
  [WorkflowGroupId.HostSecurityProvisionHids]: 'Provision HIDS',

  [WorkflowGroupId.ServerBackupProvision]: 'Server Backup',

  [WorkflowGroupId.VmBackupProvision]: 'VM Backup',

  [WorkflowGroupId.MicrosoftCreateSubscription]: 'Create Microsoft Subscription',
}
