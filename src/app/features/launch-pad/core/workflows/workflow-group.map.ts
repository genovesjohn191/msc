import { Type } from '@angular/core';

import { WorkflowGroupId } from './workflow-groups/workflow-group-type.enum';
import {
  VdcVmInstanceAddToManagementToolsWorkflowGroup,
  VdcVmInstanceRemoveFromManagementToolsWorkflowGroup,
  VdcVmInstanceProvisionWorkflowGroup,
  DedicatedStorageUnmaskVolumeWorkflowGroup,
  DedicatedStorageIncreaseVolumeWorkflowGroup,
  DedicatedStorageAttachVolumeClusterWorkflowGroup,
  DedicatedStorageCreateAndAttachVolumeClusterWorkflowGroup,
  DedicatedStorageAttachVolumeWorkflowGroup,
  DedicatedStorageRemoveZoningWorkflowGroup,
  DedicatedStorageCreateAndAttachVolumeWorkflowGroup
} from './workflow-groups';
import { WorkflowGroup } from './workflow-group.interface';

// Workflow: Assign IDs to workflow groups
export const workflowGroupMap: Map<WorkflowGroupId, Type<WorkflowGroup>> = new Map([
  [ WorkflowGroupId.VirtualDataCentreVmInstanceProvision,  VdcVmInstanceProvisionWorkflowGroup ],
  [ WorkflowGroupId.VirtualDataCentreVmInstanceAddToManagementTools, VdcVmInstanceAddToManagementToolsWorkflowGroup ],
  [ WorkflowGroupId.VirtualDataCentreVmInstanceRemoveFromManagementTools, VdcVmInstanceRemoveFromManagementToolsWorkflowGroup ],

  [ WorkflowGroupId.DedicatedStorageAttachVolume, DedicatedStorageAttachVolumeWorkflowGroup ],
  [ WorkflowGroupId.DedicatedStorageAttachVolumeCluster, DedicatedStorageAttachVolumeClusterWorkflowGroup ],
  [ WorkflowGroupId.DedicatedStorageCreateAttachVolume, DedicatedStorageCreateAndAttachVolumeWorkflowGroup ],
  [ WorkflowGroupId.DedicatedStorageCreateAttachVolumeCluster, DedicatedStorageCreateAndAttachVolumeClusterWorkflowGroup ],
  [ WorkflowGroupId.DedicatedStorageIncreaseVolume, DedicatedStorageIncreaseVolumeWorkflowGroup ],
  [ WorkflowGroupId.DedicatedStorageRemoveZoning, DedicatedStorageRemoveZoningWorkflowGroup ],
  [ WorkflowGroupId.DedicatedStorageUnmaskVolume, DedicatedStorageUnmaskVolumeWorkflowGroup ],
]);
