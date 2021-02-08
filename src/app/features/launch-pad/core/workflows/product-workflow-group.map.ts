import { ProductType } from '@app/models';
import { WorkflowGroupId } from './workflow-groups/workflow-group-type.enum';

// Workflow: Assign workflow groups to product types
export const productWorkflowGroupMap: Map<ProductType, number[]> = new Map(
  [
    [ ProductType.DedicatedManagedFirewall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.DedicatedServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.DedicatedServerVmInstance,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.DedicatedVcenterServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.PrimaryDedicatedStorage,
      [
        WorkflowGroupId.DedicatedStorageAttachVolume,
        WorkflowGroupId.DedicatedStorageAttachVolumeCluster,
        WorkflowGroupId.DedicatedStorageCreateAttachVolume,
        WorkflowGroupId.DedicatedStorageCreateAttachVolumeCluster,
        WorkflowGroupId.DedicatedStorageIncreaseVolume,
        WorkflowGroupId.DedicatedStorageRemoveZoning,
        WorkflowGroupId.DedicatedStorageUnmaskVolume,
      ]
    ],

    [ ProductType.VirtualDataCentreVmInstance,
      [
        WorkflowGroupId.VirtualDataCentreVmInstanceProvision,
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAddCvm,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.VirtualFirewall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.VirtualManagedServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],
  ]
);
