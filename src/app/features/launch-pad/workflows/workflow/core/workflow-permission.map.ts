import { McsPermission } from '@app/models';
import { WorkflowGroupId } from './workflow-groups/workflow-group-type.enum';

// Workflow: Assign permission access to workflow 
export const workflowPermissionMap: Map<McsPermission, WorkflowGroupId[]> = new Map(
  [
    [ McsPermission.InternalPrivateCloudEngineerAccess,
      [
        WorkflowGroupId.VirtualDataCentreVmInstanceProvision,
        WorkflowGroupId.VirtualDataCentreVmInstanceProvisionComplex,
        WorkflowGroupId.VirtualDataCentreNetworkCreate,
        WorkflowGroupId.VirtualDataCentreNetworkCreateCustom,
        WorkflowGroupId.VirtualDataCenterProvision,
        WorkflowGroupId.DedicatedStorageAttachVolume,
        WorkflowGroupId.DedicatedStorageAttachVolumeCluster,
        WorkflowGroupId.DedicatedStorageCreateAttachVolume,
        WorkflowGroupId.DedicatedStorageCreateAttachVolumeCluster,
        WorkflowGroupId.DedicatedStorageIncreaseVolumeSize,
        WorkflowGroupId.DedicatedStorageRemoveZoning,
        WorkflowGroupId.DedicatedStorageUnmaskVolume,
        WorkflowGroupId.StretchedDedicatedStorageCreateAttachVolume,
        WorkflowGroupId.DedicatedBladeDeprovision,
        WorkflowGroupId.DedicatedBladeProvision,
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate,
        WorkflowGroupId.HostSecurityProvisionAntiVirus,
        WorkflowGroupId.HostSecurityProvisionHids,
        WorkflowGroupId.ServerBackupProvision,
        WorkflowGroupId.VmBackupProvision,
        WorkflowGroupId.VfwAllocate,
        WorkflowGroupId.VfwDeprovision,
        WorkflowGroupId.VfwProvision,
        WorkflowGroupId.FirewallAllocate,
        WorkflowGroupId.FirewallDeprovision,
        WorkflowGroupId.FirewallProvision,
        WorkflowGroupId.FirewallProvisionAdom,
        WorkflowGroupId.FirewallUpgrade,
        WorkflowGroupId.FirewallAssessUpgradeReadiness,
        WorkflowGroupId.VirtualDataCentreDeprovision
      ]
    ],
    [ McsPermission.InternalPublicCloudEngineerAccess,
      [
        WorkflowGroupId.MicrosoftCreateSubscription,
        WorkflowGroupId.MicrosoftSoftwareSubscriptionProvision,
        WorkflowGroupId.MicrosoftProvisionReservation,
        WorkflowGroupId.AvdProvisionHostPool,
        WorkflowGroupId.VmsAvdHostPoolAdd
      ]
    ],
  ]
);
