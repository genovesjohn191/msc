import { WorkflowGroupId } from '../core/workflow-groups/workflow-group-type.enum';

// Workflow: Add workflow group to selector options
export const workflowOptions: Map<WorkflowGroupId, string> = new Map([

  [WorkflowGroupId.VirtualDataCentreVmInstanceProvision, 'Create a new virtual data centre VM instance.'],
  [WorkflowGroupId.VirtualDataCentreVmInstanceProvisionComplex, 'Create a new virtual data centre VM instance w/ Add Ons.'],

  [WorkflowGroupId.DedicatedStorageUnmaskVolume, 'Unmask dedicated storage volume.'],
  [WorkflowGroupId.DedicatedStorageIncreaseVolumeSize, 'Increase dedicated storage volume.'],
  [WorkflowGroupId.DedicatedStorageAttachVolumeCluster, 'Attach dedicated storage volume cluster.'],
  [WorkflowGroupId.DedicatedStorageCreateAttachVolumeCluster, 'Create and attach dedicated storage volume cluster.'],
  [WorkflowGroupId.DedicatedStorageAttachVolume, 'Attach existing dedicated storage volume.'],
  [WorkflowGroupId.DedicatedStorageCreateAttachVolume, 'Create new dedicated storage volume.'],
  [WorkflowGroupId.DedicatedStorageRemoveZoning, 'Remove dedicated storage zoning.'],

  [WorkflowGroupId.HostSecurityProvisionAntiVirus, 'Provision an anti-virus software.'],
  [WorkflowGroupId.HostSecurityProvisionHids, 'Provision a host intrusion prevention system.'],

  [WorkflowGroupId.ManagementToolsQueryStatus, 'Query nanagement tools status.'],
  [WorkflowGroupId.ManagementToolsAdd, 'Add to management tools.'],
  [WorkflowGroupId.ManagementToolsRemove, 'Remove from management tools.'],
  [WorkflowGroupId.ManagementToolsUpdate, 'Update in management tools.'],

  [WorkflowGroupId.MicrosoftCreateSubscription, 'Create Microsoft subscription for a tenant.'],

  [WorkflowGroupId.ServerBackupProvision, 'Provision server backup.'],

  [WorkflowGroupId.VmBackupProvision, 'Provision virtual machine backup.'],
]);