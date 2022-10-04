import { ProductType } from '@app/models';
import { WorkflowGroupId } from './workflow-groups/workflow-group-type.enum';

export interface WorkflowGroupIdInfo {
  workflowId: number;
  allowedElementStatuses?: string [];
}
// Workflow: Assign workflow groups to product types
export const productWorkflowGroupMap: Map<ProductType, WorkflowGroupIdInfo[]> = new Map(
  [
    [ ProductType.AzureProductConsumption,
      [
        {
          workflowId: WorkflowGroupId.MicrosoftCreateSubscription,
          allowedElementStatuses: [
            "TRANSPROV"
          ]
        }
      ]
    ],

    [ ProductType.AzureReservation,
      [
        {
          workflowId: WorkflowGroupId.MicrosoftProvisionReservation,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.AzureSoftwareSubscription,
      [
        {
          workflowId: WorkflowGroupId.MicrosoftSoftwareSubscriptionProvision,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.AzureVirtualDesktop,
      [
        {
          workflowId: WorkflowGroupId.AvdProvisionHostPool,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.VmsAvdHostPoolAdd,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.BrickFirewall,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.CloudFirewall,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        },
      ]
    ],

    [ ProductType.CloudLoadBalancer,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.CloudPerformanceServer,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.CloudServer,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.CloudServerPrimary,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.CustomerDedicatedFirewall,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.DedicatedLoadBalancing,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.DedicatedManagedFirewall,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.DedicatedManagedFirewallSingle,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        },
      ]
    ],

    [ ProductType.DedicatedServer,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.DedicatedBladeProvision,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.DedicatedBladeDeprovision,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.DedicatedServerVmInstance,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        },
      ]
    ],

    [ ProductType.DedicatedVcenterServer,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.DedicatedBladeProvision,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.DedicatedBladeDeprovision,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.FirewallDedicated,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.FirewallProvisionAdom,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.FirewallAllocate,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.FirewallProvision,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.FirewallDeprovision,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.FirewallAssessUpgradeReadiness,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.FirewallUpgrade,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.FirewallVa,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.FirewallProvisionAdom,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.VfwAllocate,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.VfwProvision,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.VfwDeprovision,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.FirewallAssessUpgradeReadiness,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.FirewallUpgrade,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.FirewallVlan,
      [
        {
          workflowId: WorkflowGroupId.VirtualDataCentreNetworkCreate,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.FourtyEightPortSwitch,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        },
      ]
    ],

    [ ProductType.GigabitFourtyEightPortSwitch,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        },
      ]
    ],

    [ ProductType.HostingInternetPort,
      [
        {
          workflowId: WorkflowGroupId.VirtualDataCentreNetworkCreate,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.HpServerLarge,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.HpServerMedium,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.HpServerSmall,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.HpServerVerySmall,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.Internet,
      [
        {
          workflowId: WorkflowGroupId.VirtualDataCentreNetworkCreate,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.LoadBalancerVa,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.ManagedRouter,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        }
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
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.ManagementFirewallVa,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        }
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
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.NonStandardFirewall,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.NonStandardGatewayRouter,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.NonStandardServer,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.NonStandardVirtualManagedServer,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.PortSwitch,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.PrimaryDedicatedStorage,
      [
        {
          workflowId: WorkflowGroupId.DedicatedStorageCreateAttachVolume,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.DedicatedStorageAttachVolume,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.DedicatedStorageIncreaseVolumeSize,
          allowedElementStatuses: [ ]
        },
        // WorkflowGroupId.DedicatedStorageUnmaskVolume,
        {
          workflowId: WorkflowGroupId.DedicatedStorageRemoveZoning,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.ServerBackup,
      [
        {
          workflowId: WorkflowGroupId.ServerBackupProvision,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.ServerHostIntrusionPreventionSystem,
      [
        {
          workflowId: WorkflowGroupId.HostSecurityProvisionHids,
          allowedElementStatuses: [ ]
        } 
      ]
    ],

    [ ProductType.ServerAntiVirus,
      [
        {
          workflowId: WorkflowGroupId.HostSecurityProvisionAntiVirus,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.SolarisServerLarge,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.SolarisServerMedium,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.SolarisServerSmall,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.StretchedDedicatedStorage,
      [
        {
          workflowId: WorkflowGroupId.StretchedDedicatedStorageCreateAttachVolume,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.DedicatedStorageAttachVolume,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.DedicatedStorageIncreaseVolumeSize,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.DedicatedStorageRemoveZoning,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.TwentyFourPortSwitch,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.VirtualDataCentreVmInstance,
      [
        {
          workflowId: WorkflowGroupId.VirtualDataCentreVmInstanceProvision,
          allowedElementStatuses: [ ]
        },
        // WorkflowGroupId.VirtualDataCentreVmInstanceProvisionComplex,
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.VirtualDrVirtualFirewallSwitch,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.VirtualDrVirtualServer,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.VirtualFirewall,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.FirewallProvisionAdom,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.VfwAllocate,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.VfwProvision,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.VfwDeprovision,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.FirewallAssessUpgradeReadiness,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.FirewallUpgrade,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.VirtualManagedServer,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.VirtualPrivateServer,
      [
        {
          workflowId: WorkflowGroupId.ManagementToolsQueryStatus,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsAdd,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsRemove,
          allowedElementStatuses: [ ]
        },
        {
          workflowId: WorkflowGroupId.ManagementToolsUpdate,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.VmBackup,
      [
        {
          workflowId: WorkflowGroupId.VmBackupProvision,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.VirtualCrossConnect,
      [
        {
          workflowId: WorkflowGroupId.VirtualDataCentreNetworkCreate,
          allowedElementStatuses: [ ]
        }
      ]
    ],

    [ ProductType.DataCentresCrossConnect,
      [
        {
          workflowId: WorkflowGroupId.VirtualDataCentreNetworkCreate,
          allowedElementStatuses: [ ]
        }
      ]
    ],
  ]
);
