import { Type } from '@angular/core';

import { WorkflowGroupId } from './workflow-groups/workflow-group-type.enum';
import {
  AvdProvisionHostPoolWorkflowGroup,
  DedicatedStorageUnmaskVolumeWorkflowGroup,
  DedicatedStorageIncreaseVolumeWorkflowGroup,
  DedicatedStorageAttachVolumeClusterWorkflowGroup,
  DedicatedStorageCreateAndAttachVolumeClusterWorkflowGroup,
  DedicatedStorageAttachVolumeWorkflowGroup,
  DedicatedStorageRemoveZoningWorkflowGroup,
  DedicatedStorageCreateAndAttachVolumeWorkflowGroup,
  ManagementToolsAddWorkflowGroup,
  ManagementToolsQueryStatusWorkflowGroup,
  ManagementToolsRemoveWorkflowGroup,
  VdcVmInstanceProvisionWorkflowGroup,
  HostSecurityProvisionAntiVirusWorkflowGroup,
  HostSecurityProvisionHidsWorkflowGroup,
  ManagementToolsUpdateWorkflowGroup,
  VdcVmInstanceProvisionComplexWorkflowGroup,
  MicrosoftCreateSubscriptionWorkflowGroup,
  MicrosoftReservationProvisionWorkflowGroup,
  MicrosoftSoftwareSubscriptionProvisionWorkflowGroup,
  ServerBackupProvisionWorkflowGroup,
  VmBackupProvisionWorkflowGroup,
  VdcNetworkCreateWorkflowGroup,
  VdcNetworkCreateCustomWorkflowGroup,
  VmsAvdHostPoolAddWorkflowGroup,
  FirewallProvisionAdomWorkflowGroup,
  VfwDeprovisionWorkflowGroup
} from './workflow-groups';
import { WorkflowGroup } from './workflow-group.interface';

// Workflow: Assign IDs to workflow groups
export const workflowGroupMap: Map<WorkflowGroupId, Type<WorkflowGroup>> = new Map([
  [ WorkflowGroupId.AvdProvisionHostPool,  AvdProvisionHostPoolWorkflowGroup ],
  [ WorkflowGroupId.VmsAvdHostPoolAdd,  VmsAvdHostPoolAddWorkflowGroup ],

  [ WorkflowGroupId.DedicatedStorageAttachVolume, DedicatedStorageAttachVolumeWorkflowGroup ],
  [ WorkflowGroupId.DedicatedStorageAttachVolumeCluster, DedicatedStorageAttachVolumeClusterWorkflowGroup ],
  [ WorkflowGroupId.DedicatedStorageCreateAttachVolume, DedicatedStorageCreateAndAttachVolumeWorkflowGroup ],
  [ WorkflowGroupId.DedicatedStorageCreateAttachVolumeCluster, DedicatedStorageCreateAndAttachVolumeClusterWorkflowGroup ],
  [ WorkflowGroupId.DedicatedStorageIncreaseVolumeSize, DedicatedStorageIncreaseVolumeWorkflowGroup ],
  [ WorkflowGroupId.DedicatedStorageRemoveZoning, DedicatedStorageRemoveZoningWorkflowGroup ],
  [ WorkflowGroupId.DedicatedStorageUnmaskVolume, DedicatedStorageUnmaskVolumeWorkflowGroup ],

  [ WorkflowGroupId.HostSecurityProvisionAntiVirus, HostSecurityProvisionAntiVirusWorkflowGroup ],
  [ WorkflowGroupId.HostSecurityProvisionHids, HostSecurityProvisionHidsWorkflowGroup ],

  [ WorkflowGroupId.ManagementToolsAdd, ManagementToolsAddWorkflowGroup ],
  [ WorkflowGroupId.ManagementToolsQueryStatus, ManagementToolsQueryStatusWorkflowGroup ],
  [ WorkflowGroupId.ManagementToolsRemove, ManagementToolsRemoveWorkflowGroup ],
  [ WorkflowGroupId.ManagementToolsUpdate, ManagementToolsUpdateWorkflowGroup ],

  [ WorkflowGroupId.MicrosoftCreateSubscription, MicrosoftCreateSubscriptionWorkflowGroup ],
  [ WorkflowGroupId.MicrosoftProvisionReservation, MicrosoftReservationProvisionWorkflowGroup ],
  [ WorkflowGroupId.MicrosoftSoftwareSubscriptionProvision, MicrosoftSoftwareSubscriptionProvisionWorkflowGroup ],

  [ WorkflowGroupId.ServerBackupProvision, ServerBackupProvisionWorkflowGroup ],

  [ WorkflowGroupId.VirtualDataCentreVmInstanceProvision,  VdcVmInstanceProvisionWorkflowGroup ],
  [ WorkflowGroupId.VirtualDataCentreVmInstanceProvisionComplex, VdcVmInstanceProvisionComplexWorkflowGroup ],
  [ WorkflowGroupId.VirtualDataCentreNetworkCreate, VdcNetworkCreateWorkflowGroup ],
  [ WorkflowGroupId.VirtualDataCentreNetworkCreateCustom, VdcNetworkCreateCustomWorkflowGroup ],

  [ WorkflowGroupId.VmBackupProvision,  VmBackupProvisionWorkflowGroup ],

  [ WorkflowGroupId.FirewallProvisionAdom, FirewallProvisionAdomWorkflowGroup],
  [ WorkflowGroupId.VfwDeprovision, VfwDeprovisionWorkflowGroup ],
]);
