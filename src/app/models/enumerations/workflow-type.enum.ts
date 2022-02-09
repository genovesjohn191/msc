import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum WorkflowType {
  AvdProvisionHostPool = 'launchpad.avd.provisionHostPool',
  VmsAvdHostPoolAdd = 'launchpad.avd.addVms',

  ManagedVmCreate = 'launchpad.managedvm.create',

  ManagementToolsAdd = 'launchpad.managementtools.add',
  ManagementToolsRemove = 'launchpad.managementtools.delete',
  ManagementToolsUpdate = 'launchpad.managementtools.update',
  ManagementToolsQueryStatus = 'launchpad.managementtools.querystatus',

  DedicatedStorageAttachVolume = 'launchpad.dedicatedstorage.attachvolume',
  DedicatedStorageAttachVolumeCluster = 'launchpad.dedicatedstorage.attachvolumecluster',
  DedicatedStorageCreateAttachVolume = 'launchpad.dedicatedstorage.createattachvolume',
  DedicatedStorageCreateAttachVolumeCluster = 'launchpad.dedicatedstorage.createattachvolumecluster',
  DedicatedStorageIncreaseVolume = 'launchpad.dedicatedstorage.increasevolume',
  DedicatedStorageRemoveZoning = 'launchpad.dedicatedstorage.removezoning',
  DedicatedStorageUmaskVolume = 'launchpad.dedicatedstorage.unmaskvolume',

  HostSecurityProvisionAntiVirus = 'launchpad.hostsecurity.provisionantivirus',
  HostSecurityProvisionHids = 'launchpad.hostsecurity.provisionhids',

  MicrosoftCreateSubscription = 'publiccloud.microsoft.createsubscription',
  MicrosoftReservationProvision = 'launchpad.publiccloud.reservation.provision',
  MicrosoftSoftwareSubscriptionProvision = 'publiccloud.microsoft.provisionsoftwaresubscription',

  ServerBackupProvision = 'launchpad.serverbackup.provision',

  VmBackupProvision = 'launchpad.vmbackup.provision',

  VdcNetworkCreate = 'launchpad.vdcnetwork.create',

  VfwAllocate = 'launchpad.firewall.allocateVirtual',
  VfwProvision = 'launchpad.firewall.provisionVirtual',
  VfwDeprovision = 'launchpad.firewall.deprovisionVirtual',
  FirewallProvisionAdom = 'launchpad.firewall.provisionAdom',
  FirewallAllocate = 'launchpad.firewall.allocatePhysical',
  FirewallDeprovision = 'launchpad.firewall.deprovisionPhysical',
}

/**
 * Enumeration serializer and deserializer methods
 */
export class WorkflowTypeSerialization
  extends McsEnumSerializationBase<WorkflowType> {
  constructor() { super(WorkflowType); }
}
