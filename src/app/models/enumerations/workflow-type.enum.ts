import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum WorkflowType {
  ManagedVmCreate = 'launchpad.managedvm.create',

  ManagementToolsAddCvm = 'launchpad.managementtools.addcvm',
  ManagementToolsRemoveCvm = 'launchpad.managementtools.deletecvm',
  ManagementToolsRename = 'launchpad.managementtools.rename',
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

  ServerBackupProvision = 'launchpad.serverbackup.provision',

  VmBackupProvision = 'launchpad.vmbackup.provision',
}

/**
 * Enumeration serializer and deserializer methods
 */
export class WorkflowTypeSerialization
  extends McsEnumSerializationBase<WorkflowType> {
  constructor() { super(WorkflowType); }
}
