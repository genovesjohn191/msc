import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum WorkflowType {
  ManagedVmCreate = 'launchpad.managedvm.create',
  AddHids = 'launchpad.hids.addon',

  ManagementToolsAddCvm = 'launchpad.managementtools.addcvm',
  ManagementToolsRemoveCvm = 'launchpad.managementtools.deletecvm',

  DedicatedStorageAttachVolume = 'launchpad.dedicatedstorage.attachvolume',
  DedicatedStorageAttachVolumeCluster = 'launchpad.dedicatedstorage.attachvolumecluster',
  DedicatedStorageCreateAttachVolume = 'launchpad.dedicatedstorage.createattachvolume',
  DedicatedStorageCreateAttachVolumeCluster = 'launchpad.dedicatedstorage.createattachvolumecluster',
  DedicatedStorageIncreaseVolume = 'launchpad.dedicatedstorage.increasevolume',
  DedicatedStorageRemoveZoning = 'launchpad.dedicatedstorage.removezoning',
  DedicatedStorageUmaskVolume = 'launchpad.dedicatedstorage.unmaskvolume',
}

/**
 * Enumeration serializer and deserializer methods
 */
export class WorkflowTypeSerialization
  extends McsEnumSerializationBase<WorkflowType> {
  constructor() { super(WorkflowType); }
}
