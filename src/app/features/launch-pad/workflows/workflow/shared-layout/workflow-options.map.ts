import { WorkflowGroupId } from '../core/workflow-groups/workflow-group-type.enum';

// Workflow: Add workflow group to selector options
export const workflowOptions: Map<WorkflowGroupId, string> = new Map([

  [WorkflowGroupId.VirtualDataCentreVmInstanceProvision, 'Create a new virtual data centre VM instance.'],
  [WorkflowGroupId.VirtualDataCentreVmInstanceProvisionComplex, 'Create a new virtual data centre VM instance w/ Add Ons.'],
  [WorkflowGroupId.VirtualDataCentreNetworkCreate, 'Create a new virtual data centre network.'],

  [WorkflowGroupId.DedicatedStorageUnmaskVolume, 'Unmask dedicated storage volume.'],
  [WorkflowGroupId.DedicatedStorageIncreaseVolumeSize, 'Increase dedicated storage volume.'],
  [WorkflowGroupId.DedicatedStorageAttachVolumeCluster, 'Attach dedicated storage volume cluster.'],
  [WorkflowGroupId.DedicatedStorageCreateAttachVolumeCluster, 'Create and attach dedicated storage volume cluster.'],
  [WorkflowGroupId.DedicatedStorageAttachVolume, 'Attach existing dedicated storage volume.'],
  [WorkflowGroupId.DedicatedStorageCreateAttachVolume, 'Create new dedicated storage volume.'],
  [WorkflowGroupId.DedicatedStorageRemoveZoning, 'Remove dedicated storage zoning.'],
  [WorkflowGroupId.StretchedDedicatedStorageCreateAttachVolume, 'Create new dedicated storage volume.'],

  [WorkflowGroupId.DedicatedBladeDeprovision, 'Deprovision dedicated blade.'],
  [WorkflowGroupId.DedicatedBladeProvision, 'Provision Dedicated Blade'],

  [WorkflowGroupId.HostSecurityProvisionAntiVirus, 'Provision an anti-virus software.'],
  [WorkflowGroupId.HostSecurityProvisionHids, 'Provision a host intrusion prevention system.'],

  [WorkflowGroupId.ManagementToolsQueryStatus, 'Query nanagement tools status.'],
  [WorkflowGroupId.ManagementToolsAdd, 'Add to management tools.'],
  [WorkflowGroupId.ManagementToolsRemove, 'Remove from management tools.'],
  [WorkflowGroupId.ManagementToolsUpdate, 'Update in management tools.'],

  [WorkflowGroupId.MicrosoftCreateSubscription, 'Provision Microsoft subscription for a tenant.'],
  [WorkflowGroupId.MicrosoftProvisionReservation, 'Provision Microsoft reservation for a tenant.'],
  [WorkflowGroupId.MicrosoftSoftwareSubscriptionProvision, 'Provision Microsoft software subscription for a tenant.'],

  [WorkflowGroupId.ServerBackupProvision, 'Provision server backup.'],

  [WorkflowGroupId.VmBackupProvision, 'Provision virtual machine backup.'],

  [WorkflowGroupId.AvdProvisionHostPool, 'Provision AVD Host Pool.'],
  [WorkflowGroupId.VmsAvdHostPoolAdd, 'Add VMs to AVD Host Pool.'],

  [WorkflowGroupId.VfwAllocate, 'Allocate Virtual Firewall'],
  [WorkflowGroupId.VfwProvision, 'Provision Virtual Firewall'],
  [WorkflowGroupId.VfwDeprovision, 'Deprovision Virtual Firewall'],
  [WorkflowGroupId.FirewallProvision, 'Provision Physical Firewall'],
  [WorkflowGroupId.FirewallProvisionAdom, 'Provision Firewall ADOM'],
  [WorkflowGroupId.FirewallAllocate, 'Allocate Physical Firewall'],
  [WorkflowGroupId.FirewallDeprovision, 'Deprovision Physical Firewall'],
  [WorkflowGroupId.FirewallUpgrade, 'Upgrade Firewall'],
  [WorkflowGroupId.FirewallAssessUpgradeReadiness, 'Assess Firewall Upgrade Readiness'],
]);
