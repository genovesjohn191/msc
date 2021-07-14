import { ProductType } from '@app/models';
import { WorkflowGroupId } from './workflow-groups/workflow-group-type.enum';

// Workflow: Assign workflow groups to product types
export const productWorkflowGroupMap: Map<ProductType, number[]> = new Map(
  [
    [ ProductType.AzureProductConsumption,
      [
        WorkflowGroupId.MicrosoftCreateSubscription
        // WorkflowGroupId.MicrosoftProvisionReservation
      ]
    ],

    [ ProductType.AzureSoftwareSubscription,
      [
        WorkflowGroupId.MicrosoftSoftwareSubscriptionProvision
      ]
    ],

    [ ProductType.BrickFirewall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.CloudFirewall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.CloudLoadBalancer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.CloudPerformanceServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.CloudServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.CloudServerPrimary,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.CloudServicesGateway,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.CustomerDedicatedFirewall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.DedicatedLoadBalancing,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.DedicatedManagedFirewall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.DedicatedManagedFirewallSingle,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.DedicatedNetworkUtm,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.DedicatedServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.DedicatedServerVmInstance,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.DedicatedSras,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.DedicatedVcenterServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.FirewallDedicated,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.FirewallVa,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.FirewallVlan,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.FirewallVxlan,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.FourtyEightPortSwitch,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.GigabitFourtyEightPortSwitch,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.GlobalServerLoadBalancing,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.HostingClientToSiteVpn,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.HostingInternetPort,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.HostingSiteToSiteVpn,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.HpServerLarge,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.HpServerMedium,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.HpServerSmall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.HpServerVerySmall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.InfrastructureProxy,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.Internet,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.LoadBalancerVa,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.LoadBalancingChange,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.LoadBalancingGeneral,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.ManagedRouter,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.ManagedStorageLun,
      [ ]
    ],

    [ ProductType.ManagedStorageSanDisk,
      [ ]
    ],

    [ ProductType.ManagedSwitch,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.ManagementFirewallVa,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.NasRaidOneDisk,
      [ ]
    ],

    [ ProductType.NasRaidOneServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.NasRaidSDisk,
      [ ]
    ],

    [ ProductType.NasRaidSServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.NetworkAttachedStorage,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.NonStandardDedicatedLoadBalancing,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.NonStandardFirewall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.NonStandardGatewayRouter,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.NonStandardServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.NonStandardVirtualManagedServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.PerformanceInternet,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.PortSwitch,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.PrimaryDedicatedStorage,
      [
        WorkflowGroupId.DedicatedStorageCreateAttachVolume,
        WorkflowGroupId.DedicatedStorageAttachVolume,
        WorkflowGroupId.DedicatedStorageIncreaseVolumeSize,
        // WorkflowGroupId.DedicatedStorageUnmaskVolume,
        WorkflowGroupId.DedicatedStorageRemoveZoning
      ]
    ],

    [ ProductType.SanRaidOneServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.SanRaidSServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.SecureWebGateway,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
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
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.SolarisServerMedium,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.SolarisServerSmall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.StretchedDedicatedStorage,
      [ ]
    ],

    [ ProductType.TwentyFourPortSwitch,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.VirtualDataCentreVmInstance,
      [
        WorkflowGroupId.VirtualDataCentreVmInstanceProvision,
        // WorkflowGroupId.VirtualDataCentreVmInstanceProvisionComplex,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.VirtualDrVirtualFirewallSwitch,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.VirtualDrVirtualServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.VirtualFirewall,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.VirtualManagedServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.VirtualPrivateServer,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate
      ]
    ],

    [ ProductType.VmBackup,
      [
        WorkflowGroupId.VmBackupProvision
      ]
    ],
  ]
);
