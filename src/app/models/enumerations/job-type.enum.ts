import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum JobType {
  Undefined = 0,
  // Caching
  CatalogRefreshCache  = 1,

  // Jobs for "/servers" endpoint must use prefix 100XXX followed by 3 digit number
  SelfManagedServerCreate = 100001,
  SelfManagedServerUpdateCompute = 100002,
  SelfManagedServerDelete = 100003,
  SelfManagedServerClone = 100004,
  SelfManagedServerRename = 100005,
  ManagedServerProvision = 100006,
  ManagedServerScale = 100007,
  ManagedServerRaiseInviewLevel = 100008,
  ManagedServerClone = 100009,

  // Server Snapshot
  ServerCreateSnapshot = 100051,
  ServerApplySnapshot = 100052,
  ServerDeleteSnapshot = 100053,

  // Server Command
  ServerChangePowerState = 100101,

  // Server Disk Management
  ServerCreateDisk = 100151,
  ServerUpdateDisk = 100152,
  ServerDeleteDisk = 100153,

  // Server Password
  ServerResetPassword = 100201,

  // Server NIC Management
  ServerCreateNic = 100251,
  ServerUpdateNic = 100252,
  ServerDeleteNic = 100253,

  // Server Media Management
  ServerAttachMedia = 100301,
  ServerDetachMedia = 100302,

  // Resource Media
  ResourceCreateCatalogItem = 100401,

  // Patching
  ManagedServerPerformOsUpdateAnalysis = 100501,
  ManagedServerApplyOsUpdates = 100502,

  // VDC Storage
  VdcExpandStorage = 100601,
  VdcProvisionStorage = 100602,
  VdcScaleCompute = 100603,

  // Host Security
  ManagedServerProvisionAntiVirus = 100604,
  ManagedServerProvisionHids = 100605,

  // Backup
  ManagedServerProvisionServerBackup = 100606,
  ManagedServerProvisionVmBackup = 100607,
  ManagedServerProvisionBat = 1000608,

  // Launchpad
  LaunchpadManagedServerCreate = 102001,
  LaunchpadManagementToolsAddCvm = 102002,
  LaunchpadManagementToolsDeleteCvm = 102003,
  LaunchpadBackupProvisionServerBackup = 102004,
  LaunchpadBackupProvisionVmBackup = 102005,
  LaunchpadDedicatedStorageUnmaskVolume = 102006,
  LaunchpadDedicatedStorageIncreaseVolume = 102007,
  LaunchpadHostSecurityProvisionAntiVirus = 102008,
  LaunchpadHostSecurityProvisionHids = 102009,
  LaunchpadDedicatedStorageCreateAttachVolume = 102010,
  LaunchpadDedicatedStorageAttachVolume = 102011,
  LaunchpadDedicatedStorageCreateAttachVolumeCluster = 102012,
  LaunchpadDedicatedStorageAttachVolumeCluster = 102013,
  LaunchpadDedicatedStorageRemoveZoning = 102014,

  // Microsoft License
  PublicCloudLicenseChangeCount = 2000001,

  // Internet
  InternetPortPlanChange = 3000001,
}

export const jobTypeText = {
  [JobType.SelfManagedServerCreate]: 'New Server',
  [JobType.SelfManagedServerUpdateCompute]: 'Scale Server',
  [JobType.SelfManagedServerDelete]: 'Delete Server',
  [JobType.SelfManagedServerClone]: 'Clone Server',
  [JobType.SelfManagedServerRename]: 'Rename Server',
  [JobType.ManagedServerProvision]: 'New Managed Server',
  [JobType.ServerCreateSnapshot]: 'New Snapshot',
  [JobType.ServerApplySnapshot]: 'Restore Snapshot',
  [JobType.ServerDeleteSnapshot]: 'Delete Snapshot',
  [JobType.ServerChangePowerState]: 'Change Server Power-state',
  [JobType.ServerCreateDisk]: 'New Disk',
  [JobType.ServerUpdateDisk]: 'Scale Disk',
  [JobType.ServerDeleteDisk]: 'Delete Disk',
  [JobType.ServerResetPassword]: 'Reset Server Password',
  [JobType.ServerCreateNic]: 'New NIC',
  [JobType.ServerUpdateNic]: 'Update NIC',
  [JobType.ServerDeleteNic]: 'Delete NIC',
  [JobType.ServerAttachMedia]: 'Attach Media',
  [JobType.ServerDetachMedia]: 'Detach Media',
  [JobType.ResourceCreateCatalogItem]: 'New Catalog Media',
  [JobType.ManagedServerPerformOsUpdateAnalysis]: 'Perform OS Inspection',
  [JobType.ManagedServerApplyOsUpdates]: 'Apply OS Updates',
  [JobType.ManagedServerScale]: 'Scale Managed Server',
  [JobType.ManagedServerRaiseInviewLevel]: 'Raise Managed Server Inview Level',
  [JobType.VdcExpandStorage]: 'Expand VDC Storage',
  [JobType.VdcScaleCompute]: 'Scale VDC',
  [JobType.ManagedServerProvisionServerBackup]: 'Backup Server',
  [JobType.ManagedServerProvisionVmBackup]: 'Backup VM',
  [JobType.ManagedServerProvisionAntiVirus]: 'New Anti-Virus',
  [JobType.ManagedServerProvisionHids]: 'New HIDS',
  [JobType.ManagedServerProvisionBat]: 'New Backup Aggregation Target',

  [JobType.LaunchpadManagedServerCreate]: 'New Managed Server',
  [JobType.LaunchpadManagementToolsAddCvm]: 'Add CVM to Management Tools',
  [JobType.LaunchpadManagementToolsDeleteCvm]: 'Remove CVM from Management Tools',
  [JobType.LaunchpadBackupProvisionServerBackup]: 'Backup Server',
  [JobType.LaunchpadBackupProvisionVmBackup]: 'Backup VM',
  [JobType.LaunchpadDedicatedStorageUnmaskVolume]: 'Unmask Dedicated Storage Volume',
  [JobType.LaunchpadDedicatedStorageIncreaseVolume]: 'Increase Dedicated Storage Volume',
  [JobType.LaunchpadHostSecurityProvisionAntiVirus]: 'New Anti-Virus',
  [JobType.LaunchpadHostSecurityProvisionHids]: 'New HIDS',
  [JobType.LaunchpadDedicatedStorageCreateAttachVolume]: 'Create and Attach Dedicated Storage Volume',
  [JobType.LaunchpadDedicatedStorageAttachVolume]: 'Attach Dedicated Storage Volume',
  [JobType.LaunchpadDedicatedStorageCreateAttachVolumeCluster]: 'Create and Attach Dedicated Storage Volume Cluster',
  [JobType.LaunchpadDedicatedStorageAttachVolumeCluster]: 'Attach Dedicated Storage Volume Cluster',
  [JobType.LaunchpadDedicatedStorageRemoveZoning]: 'Remove Dedicated Storage Zoning',

  [JobType.PublicCloudLicenseChangeCount]: 'Change License Count',
  [JobType.InternetPortPlanChange]: 'Change Internet Port Plan',
};

/**
 * Enumeration serializer and deserializer methods
 */
export class JobTypeSerialization
  extends McsEnumSerializationBase<JobType> {
  constructor() { super(JobType); }
}
