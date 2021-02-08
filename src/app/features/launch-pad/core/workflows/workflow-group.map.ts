import { Type } from '@angular/core';

import { WorkflowGroupId } from './workflow-groups/workflow-group-type.enum';
import {
  ManagementToolsAddCvmWorkflowGroup,
  ManagementToolsRemoveCvmWorkflowGroup,
  VdcVmInstanceProvisionWorkflowGroup,
  DedicatedStorageUnmaskVolumeWorkflowGroup,
  DedicatedStorageIncreaseVolumeWorkflowGroup,
  DedicatedStorageAttachVolumeClusterWorkflowGroup,
  DedicatedStorageCreateAndAttachVolumeClusterWorkflowGroup,
  DedicatedStorageAttachVolumeWorkflowGroup,
  DedicatedStorageRemoveZoningWorkflowGroup,
  DedicatedStorageCreateAndAttachVolumeWorkflowGroup,
  ManagementToolsQueryStatusWorkflowGroup
} from './workflow-groups';
import { WorkflowGroup } from './workflow-group.interface';

// Workflow: Assign IDs to workflow groups
export const workflowGroupMap: Map<WorkflowGroupId, Type<WorkflowGroup>> = new Map([
  [ WorkflowGroupId.VirtualDataCentreVmInstanceProvision,  VdcVmInstanceProvisionWorkflowGroup ],

  [ WorkflowGroupId.DedicatedStorageAttachVolume, DedicatedStorageAttachVolumeWorkflowGroup ],
  [ WorkflowGroupId.DedicatedStorageAttachVolumeCluster, DedicatedStorageAttachVolumeClusterWorkflowGroup ],
  [ WorkflowGroupId.DedicatedStorageCreateAttachVolume, DedicatedStorageCreateAndAttachVolumeWorkflowGroup ],
  [ WorkflowGroupId.DedicatedStorageCreateAttachVolumeCluster, DedicatedStorageCreateAndAttachVolumeClusterWorkflowGroup ],
  [ WorkflowGroupId.DedicatedStorageIncreaseVolume, DedicatedStorageIncreaseVolumeWorkflowGroup ],
  [ WorkflowGroupId.DedicatedStorageRemoveZoning, DedicatedStorageRemoveZoningWorkflowGroup ],
  [ WorkflowGroupId.DedicatedStorageUnmaskVolume, DedicatedStorageUnmaskVolumeWorkflowGroup ],

  [ WorkflowGroupId.ManagementToolsQueryStatus, ManagementToolsQueryStatusWorkflowGroup ],
  [ WorkflowGroupId.ManagementToolsAddCvm, ManagementToolsAddCvmWorkflowGroup ],
  [ WorkflowGroupId.ManagementToolsRemoveCvm, ManagementToolsRemoveCvmWorkflowGroup ],
]);
