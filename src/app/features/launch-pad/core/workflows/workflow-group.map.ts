import { Type } from '@angular/core';

import { WorkflowGroupId } from './workflow-groups/workflow-group-type.enum';
import {
  DedicatedStorageUnmaskVolumeWorkflowGroup,
  DedicatedStorageIncreaseVolumeWorkflowGroup,
  DedicatedStorageAttachVolumeClusterWorkflowGroup,
  DedicatedStorageCreateAndAttachVolumeClusterWorkflowGroup,
  DedicatedStorageAttachVolumeWorkflowGroup,
  DedicatedStorageRemoveZoningWorkflowGroup,
  DedicatedStorageCreateAndAttachVolumeWorkflowGroup,
  ManagementToolsAddCvmWorkflowGroup,
  ManagementToolsQueryStatusWorkflowGroup,
  ManagementToolsRemoveCvmWorkflowGroup,
  VdcVmInstanceProvisionWorkflowGroup,
  HostSecurityProvisionAntiVirusWorkflowGroup,
  HostSecurityProvisionHidsWorkflowGroup
} from './workflow-groups';
import { WorkflowGroup } from './workflow-group.interface';

// Workflow: Assign IDs to workflow groups
export const workflowGroupMap: Map<WorkflowGroupId, Type<WorkflowGroup>> = new Map([
  [ WorkflowGroupId.DedicatedStorageAttachVolume, DedicatedStorageAttachVolumeWorkflowGroup ],
  [ WorkflowGroupId.DedicatedStorageAttachVolumeCluster, DedicatedStorageAttachVolumeClusterWorkflowGroup ],
  [ WorkflowGroupId.DedicatedStorageCreateAttachVolume, DedicatedStorageCreateAndAttachVolumeWorkflowGroup ],
  [ WorkflowGroupId.DedicatedStorageCreateAttachVolumeCluster, DedicatedStorageCreateAndAttachVolumeClusterWorkflowGroup ],
  [ WorkflowGroupId.DedicatedStorageIncreaseVolume, DedicatedStorageIncreaseVolumeWorkflowGroup ],
  [ WorkflowGroupId.DedicatedStorageRemoveZoning, DedicatedStorageRemoveZoningWorkflowGroup ],
  [ WorkflowGroupId.DedicatedStorageUnmaskVolume, DedicatedStorageUnmaskVolumeWorkflowGroup ],

  [ WorkflowGroupId.HostSecurityProvisionAntiVirus, HostSecurityProvisionAntiVirusWorkflowGroup ],
  [ WorkflowGroupId.HostSecurityProvisionHids, HostSecurityProvisionHidsWorkflowGroup ],

  [ WorkflowGroupId.ManagementToolsAddCvm, ManagementToolsAddCvmWorkflowGroup ],
  [ WorkflowGroupId.ManagementToolsQueryStatus, ManagementToolsQueryStatusWorkflowGroup ],
  [ WorkflowGroupId.ManagementToolsRemoveCvm, ManagementToolsRemoveCvmWorkflowGroup ],

  [ WorkflowGroupId.VirtualDataCentreVmInstanceProvision,  VdcVmInstanceProvisionWorkflowGroup ],
]);
