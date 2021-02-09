import { ProductType } from '@app/models';
import { WorkflowGroupId } from './workflow-groups/workflow-group-type.enum';

// Workflow: Assign workflow groups to product types
export const productWorkflowGroupMap: Map<ProductType, number[]> = new Map(
  [
    [ ProductType.BrickFirewall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.CloudFirewall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.CloudLoadBalancer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.CloudPerformanceServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.CloudServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.CloudServerPrimary,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.CloudServicesGateway,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.CustomerDedicatedFirewall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.DedicatedLoadBalancing,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.DedicatedManagedFirewall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.DedicatedManagedFirewallSingle,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.DedicatedNetworkUtm,
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

    [ ProductType.DedicatedSras,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.DedicatedVcenterServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.FirewallDedicated,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.FirewallVa,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.FirewallVlan,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.FirewallVxlan,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.FourtyEightPortSwitch,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.GigabitFourtyEightPortSwitch,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.GlobalServerLoadBalancing,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.HostingClientToSiteVpn,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.HostingInternetPort,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.HostingSiteToSiteVpn,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.HpServerLarge,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.HpServerMedium,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.HpServerSmall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.HpServerVerySmall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.InfrastructureProxy,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.Internet,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.LoadBalancerVa,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.LoadBalancingChange,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.LoadBalancingGeneral,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.ManagedRouter,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.ManagedStorageLun,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.ManagedStorageSanDisk,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.ManagedSwitch,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.ManagementFirewallVa,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.NasRaidOneDisk,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.NasRaidOneServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.NasRaidSDisk,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.NasRaidSServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.NetworkAttachedStorage,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.NonStandardDedicatedLoadBalancing,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.NonStandardFirewall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.NonStandardGatewayRouter,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.NonStandardServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.NonStandardVirtualManagedServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.PerformanceInternet,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.PortSwitch,
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

    [ ProductType.SanRaidOneServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.SanRaidSServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.SecureWebGateway,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.SolarisServerLarge,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.SolarisServerMedium,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.SolarisServerSmall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.StretchedDedicatedStorage,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.TwentyFourPortSwitch,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
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

    [ ProductType.VirtualDrVirtualFirewallSwitch,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],

    [ ProductType.VirtualDrVirtualServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
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

    [ ProductType.VirtualPrivateServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus
      ]
    ],
  ]
);
