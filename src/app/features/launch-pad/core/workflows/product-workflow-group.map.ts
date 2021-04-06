import { ProductType } from '@app/models';
import { WorkflowGroupId } from './workflow-groups/workflow-group-type.enum';

// Workflow: Assign workflow groups to product types
export const productWorkflowGroupMap: Map<ProductType, number[]> = new Map(
  [
    [ ProductType.AzureProductConsumption,
      [
        WorkflowGroupId.MicrosoftCreateSubscription
      ]
    ],

    [ ProductType.BrickFirewall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.CloudFirewall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.CloudLoadBalancer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.CloudPerformanceServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.CloudServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.CloudServerPrimary,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.CloudServicesGateway,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.CustomerDedicatedFirewall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.DedicatedLoadBalancing,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.DedicatedManagedFirewall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.DedicatedManagedFirewallSingle,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.DedicatedNetworkUtm,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.DedicatedServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm,
        WorkflowGroupId.ManagementToolsRename
      ]
    ],

    [ ProductType.DedicatedServerVmInstance,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm,
        WorkflowGroupId.ManagementToolsRename
      ]
    ],

    [ ProductType.DedicatedSras,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.DedicatedVcenterServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.FirewallDedicated,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.FirewallVa,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.FirewallVlan,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.FirewallVxlan,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.FourtyEightPortSwitch,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.GigabitFourtyEightPortSwitch,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.GlobalServerLoadBalancing,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.HostingClientToSiteVpn,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.HostingInternetPort,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.HostingSiteToSiteVpn,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.HpServerLarge,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.HpServerMedium,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.HpServerSmall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.HpServerVerySmall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.InfrastructureProxy,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.Internet,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.LoadBalancerVa,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.LoadBalancingChange,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.LoadBalancingGeneral,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.ManagedRouter,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.ManagedStorageLun,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.ManagedStorageSanDisk,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.ManagedSwitch,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.ManagementFirewallVa,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.NasRaidOneDisk,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.NasRaidOneServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.NasRaidSDisk,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.NasRaidSServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.NetworkAttachedStorage,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.NonStandardDedicatedLoadBalancing,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.NonStandardFirewall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.NonStandardGatewayRouter,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.NonStandardServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.NonStandardVirtualManagedServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.PerformanceInternet,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.PortSwitch,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
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
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.SanRaidSServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.SecureWebGateway,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.ServerBackup,
      [
        WorkflowGroupId.ServerBackupProvision
      ]
    ],

    [ ProductType.ServerHostIntrusionPreventionSystem,
      [
        WorkflowGroupId.HostSecurityProvisionHids
      ]
    ],

    [ ProductType.ServerAntiVirus,
      [
        WorkflowGroupId.HostSecurityProvisionAntiVirus
      ]
    ],

    [ ProductType.SolarisServerLarge,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.SolarisServerMedium,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.SolarisServerSmall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.StretchedDedicatedStorage,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.TwentyFourPortSwitch,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.VirtualDataCentreVmInstance,
      [
        WorkflowGroupId.VirtualDataCentreVmInstanceProvision,
        // WorkflowGroupId.VirtualDataCentreVmInstanceProvisionComplex,
        WorkflowGroupId.ManagementToolsAddCvm,
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm,
        WorkflowGroupId.ManagementToolsRename
      ]
    ],

    [ ProductType.VirtualDrVirtualFirewallSwitch,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.VirtualDrVirtualServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.VirtualFirewall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.VirtualManagedServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.VirtualPrivateServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemoveCvm
      ]
    ],

    [ ProductType.VmBackup,
      [
        WorkflowGroupId.VmBackupProvision
      ]
    ],
  ]
);
