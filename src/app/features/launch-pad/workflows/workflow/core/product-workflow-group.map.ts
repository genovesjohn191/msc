import { ProductType } from '@app/models';
import { WorkflowGroupId } from './workflow-groups/workflow-group-type.enum';

// Workflow: Assign workflow groups to product types
export const productWorkflowGroupMap: Map<ProductType, number[]> = new Map(
  [
    [ ProductType.AzureProductConsumption,
      [
        WorkflowGroupId.MicrosoftCreateSubscription,
      ]
    ],

    [ ProductType.AzureReservation,
      [
        WorkflowGroupId.MicrosoftProvisionReservation
      ]
    ],

    [ ProductType.AzureSoftwareSubscription,
      [
        WorkflowGroupId.MicrosoftSoftwareSubscriptionProvision
      ]
    ],

    [ ProductType.AzureVirtualDesktop,
      [
        WorkflowGroupId.AvdProvisionHostPool,
        WorkflowGroupId.VmsAvdHostPoolAdd
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
        WorkflowGroupId.ManagementToolsUpdate,
        WorkflowGroupId.FirewallProvisionAdom
      ]
    ],

    [ ProductType.FirewallVa,
      [
        WorkflowGroupId.ManagementToolsQueryStatus,
        WorkflowGroupId.ManagementToolsAdd,
        WorkflowGroupId.ManagementToolsRemove,
        WorkflowGroupId.ManagementToolsUpdate,
        WorkflowGroupId.FirewallProvisionAdom,
        WorkflowGroupId.VfwDeprovision
      ]
    ],

    [ ProductType.FirewallVlan,
      [
        WorkflowGroupId.VirtualDataCentreNetworkCreate
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

    [ ProductType.HostingInternetPort,
      [
        WorkflowGroupId.VirtualDataCentreNetworkCreate
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


    [ ProductType.Internet,
      [
        WorkflowGroupId.VirtualDataCentreNetworkCreate
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


    [ ProductType.NasRaidSDisk,
      [ ]
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
        WorkflowGroupId.ManagementToolsUpdate,
        WorkflowGroupId.VfwDeprovision,
        WorkflowGroupId.FirewallProvisionAdom
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

    [ ProductType.VirtualCrossConnect,
      [
        WorkflowGroupId.VirtualDataCentreNetworkCreate
      ]
    ],

    [ ProductType.DataCentresCrossConnect,
      [
        WorkflowGroupId.VirtualDataCentreNetworkCreate
      ]
    ],
  ]
);
