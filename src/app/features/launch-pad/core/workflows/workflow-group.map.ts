import { Type } from '@angular/core';

import { WorkflowGroupId } from './workflow-groups/workflow-group-type.enum';
import {
  AddToManagementToolsCvmWorkflowGroup,
  RemoveFromManagementToolsCvmWorkflowGroup,
  ProvisionVirtualDataCentreVmInstanceWorkflowGroup,
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
  [ WorkflowGroupId.VirtualDataCentreVmInstanceProvision, ProvisionVirtualDataCentreVmInstanceWorkflowGroup ],
  [ WorkflowGroupId.VirtualDataCentreVmInstanceAddToManagementTools, AddToManagementToolsCvmWorkflowGroup ],
  [ WorkflowGroupId.VirtualDataCentreVmInstanceRemoveFromManagementTools, RemoveFromManagementToolsCvmWorkflowGroup ],

  [ WorkflowGroupId.DedicatedStorageAttachVolume, DedicatedStorageAttachVolumeWorkflowGroup ],
  [ WorkflowGroupId.DedicatedStorageAttachVolumeCluster, DedicatedStorageAttachVolumeClusterWorkflowGroup ],
  [ WorkflowGroupId.DedicatedStorageCreateAttachVolume, DedicatedStorageCreateAndAttachVolumeWorkflowGroup ],
  [ WorkflowGroupId.DedicatedStorageCreateAttachVolumeCluster, DedicatedStorageCreateAndAttachVolumeClusterWorkflowGroup ],
  [ WorkflowGroupId.DedicatedStorageIncreaseVolume, DedicatedStorageIncreaseVolumeWorkflowGroup ],
  [ WorkflowGroupId.DedicatedStorageRemoveZoning, DedicatedStorageRemoveZoningWorkflowGroup ],
  [ WorkflowGroupId.DedicatedStorageUnmaskVolume, DedicatedStorageUnmaskVolumeWorkflowGroup ],
]);
