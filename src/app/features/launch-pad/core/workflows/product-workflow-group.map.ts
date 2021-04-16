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
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.CloudFirewall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.CloudLoadBalancer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.CloudPerformanceServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.CloudServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.CloudServerPrimary,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.CloudServicesGateway,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.CustomerDedicatedFirewall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.DedicatedLoadBalancing,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.DedicatedManagedFirewall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.DedicatedManagedFirewallSingle,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.DedicatedNetworkUtm,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.DedicatedServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.DedicatedServerVmInstance,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.DedicatedSras,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.DedicatedVcenterServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.FirewallDedicated,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.FirewallVa,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.FirewallVlan,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.FirewallVxlan,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.FourtyEightPortSwitch,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.GigabitFourtyEightPortSwitch,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.GlobalServerLoadBalancing,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.HostingClientToSiteVpn,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.HostingInternetPort,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.HostingSiteToSiteVpn,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.HpServerLarge,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.HpServerMedium,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.HpServerSmall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.HpServerVerySmall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.InfrastructureProxy,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.Internet,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.LoadBalancerVa,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.LoadBalancingChange,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.LoadBalancingGeneral,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.ManagedRouter,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.ManagedStorageLun,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.ManagedStorageSanDisk,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.ManagedSwitch,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.ManagementFirewallVa,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.NasRaidOneDisk,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.NasRaidOneServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.NasRaidSDisk,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.NasRaidSServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.NetworkAttachedStorage,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.NonStandardDedicatedLoadBalancing,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.NonStandardFirewall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.NonStandardGatewayRouter,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.NonStandardServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.NonStandardVirtualManagedServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.PerformanceInternet,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.PortSwitch,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.PrimaryDedicatedStorage,
      [
        WorkflowGroupId.DedicatedStorageCreateAttachVolume,
        WorkflowGroupId.DedicatedStorageAttachVolume,
        WorkflowGroupId.DedicatedStorageIncreaseVolumeSize,
        WorkflowGroupId.DedicatedStorageUnmaskVolume,
        WorkflowGroupId.DedicatedStorageRemoveZoning
      ]
    ],

    [ ProductType.SanRaidOneServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.SanRaidSServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.SecureWebGateway,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
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
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.SolarisServerMedium,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.SolarisServerSmall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.StretchedDedicatedStorage,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.TwentyFourPortSwitch,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.VirtualDataCentreVmInstance,
      [
        WorkflowGroupId.VirtualDataCentreVmInstanceProvision,
        // WorkflowGroupId.VirtualDataCentreVmInstanceProvisionComplex,
        WorkflowGroupId.ManagementToolsAddCvm,
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.VirtualDrVirtualFirewallSwitch,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.VirtualDrVirtualServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.VirtualFirewall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.VirtualManagedServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.VirtualPrivateServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove
      ]
    ],

    [ ProductType.VmBackup,
      [
        WorkflowGroupId.VmBackupProvision
      ]
    ],
  ]
);
