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
  VirtualDataCentreNetworkCreate = 100003,
  VirtualDataCentreNetworkCreateCustom = 100004,

  DedicatedStorageAttachVolume = 200001,
  DedicatedStorageAttachVolumeCluster  = 200002,
  DedicatedStorageCreateAttachVolume  = 200003,
  DedicatedStorageCreateAttachVolumeCluster = 200004,
  DedicatedStorageIncreaseVolumeSize  = 200005,
  DedicatedStorageRemoveZoning = 200006,
  DedicatedStorageUnmaskVolume = 200007,

  ManagementToolsQueryStatus = 300001,
  ManagementToolsAdd = 300002,
  ManagementToolsRemove = 300003,
  ManagementToolsUpdate = 300004,

  HostSecurityProvisionAntiVirus = 400000,
  HostSecurityProvisionHids = 400001,

  ServerBackupProvision = 500000,

  VmBackupProvision = 600000,

  MicrosoftCreateSubscription = 700000,
  MicrosoftProvisionReservation = 700001,
  MicrosoftSoftwareSubscriptionProvision = 700002,

  AvdProvisionHostPool = 800000,
  VmsAvdHostPoolAdd = 800001,

  VfwAllocate = 900000,
  VfwDeprovision = 900001,
  VfwProvision = 900002,
  FirewallAllocate = 900003,
  FirewallDeprovision = 900004,
  FirewallProvision = 900005,
  FirewallProvisionAdom = 900006,
}

export const workflowGroupIdText = {
  [WorkflowGroupId.VirtualDataCentreVmInstanceProvision]: 'Provision Virtual Data Centre VM Instance',
  [WorkflowGroupId.VirtualDataCentreVmInstanceProvisionComplex]: 'Provision Virtual Data Centre VM Instance+',
  [WorkflowGroupId.VirtualDataCentreNetworkCreate]: 'Create VDC Network',
  [WorkflowGroupId.VirtualDataCentreNetworkCreateCustom]: 'Create VDC Network',

  [WorkflowGroupId.DedicatedStorageAttachVolume]: 'Attach Existing Volume',
  [WorkflowGroupId.DedicatedStorageAttachVolumeCluster]: 'Attach Volume Cluster',
  [WorkflowGroupId.DedicatedStorageCreateAttachVolume]: 'Create New Volume',
  [WorkflowGroupId.DedicatedStorageCreateAttachVolumeCluster]: 'Create and Attach Volume Cluster',
  [WorkflowGroupId.DedicatedStorageIncreaseVolumeSize]: 'Increase Volume Size',
  [WorkflowGroupId.DedicatedStorageRemoveZoning]: 'Remove Zoning',
  [WorkflowGroupId.DedicatedStorageUnmaskVolume]: 'Unmask Volume',

  [WorkflowGroupId.ManagementToolsQueryStatus]: 'Query Management Tools Status',
  [WorkflowGroupId.ManagementToolsAdd]: 'Add To Management Tools',
  [WorkflowGroupId.ManagementToolsRemove]: 'Remove From Management Tools',
  [WorkflowGroupId.ManagementToolsUpdate]: 'Update In Management Tools',

  [WorkflowGroupId.HostSecurityProvisionAntiVirus]: 'Provision Anti-Virus',
  [WorkflowGroupId.HostSecurityProvisionHids]: 'Provision HIDS',

  [WorkflowGroupId.ServerBackupProvision]: 'Server Backup',

  [WorkflowGroupId.VmBackupProvision]: 'VM Backup',

  [WorkflowGroupId.MicrosoftCreateSubscription]: 'Create Microsoft Subscription',
  [WorkflowGroupId.MicrosoftProvisionReservation]: 'Provision Microsoft Reservation',
  [WorkflowGroupId.MicrosoftSoftwareSubscriptionProvision]: 'Provision Microsoft Software Subscription',

  [WorkflowGroupId.AvdProvisionHostPool]: 'Provision AVD Host Pool',
  [WorkflowGroupId.VmsAvdHostPoolAdd]: 'Add VMs to AVD Host Pool',

  [WorkflowGroupId.VfwAllocate]: 'Allocate Virtual Firewall',
  [WorkflowGroupId.VfwProvision]: 'Provision Virtual Firewall',
  [WorkflowGroupId.FirewallProvisionAdom]: 'Provision Firewall ADOM',
  [WorkflowGroupId.FirewallProvision]: 'Provision Physical Firewall',
  [WorkflowGroupId.VfwDeprovision]: 'Deprovision Virtual Firewall',
  [WorkflowGroupId.FirewallAllocate]: 'Allocate Physical Firewall',
  [WorkflowGroupId.FirewallDeprovision]: 'Deprovision Physical Firewall',
}

