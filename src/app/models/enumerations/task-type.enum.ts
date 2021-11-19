import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum TaskType {
  Undefined = 0,

  // Core
  // Range 1-2999
  CatalogRefreshCache = 1,

  // Orchestration
  // Range 3000-4999
  ServerChangePowerState = 3000,
  SelfManagedServerCreate = 3001,
  SelfManagedServerUpdateCompute = 3002,
  SelfManagedServerDelete = 3003,
  ServerCreateSnapshot = 3004,
  ServerApplySnapshot = 3005,
  ServerDeleteSnapshot = 3006,
  ServerCreateDisk = 3007,
  ServerUpdateDisk = 3008,
  ServerDeleteDisk = 3009,
  SelfManagedServerClone = 3010,
  ServerResetPassword = 3011,
  ServerCreateNic = 3012,
  ServerUpdateNic = 3013,
  ServerDeleteNic = 3014,
  ServerAttachMedia = 3015,
  ServerDetachMedia = 3016,
  SelfManagedServerRename = 3017,
  ResourceCreateCatalogItem = 3018,
  ManagedServerPerformOsUpdateAnalysis = 3019,
  ManagedServerApplyOsUpdates = 3020,

  // Orchestration Ordering
  // Range 5000-6999
  ManagedServerProvision = 5000,
  ManagedServerProvisionAntiVirus = 5001,
  ManagedServerScale = 5002,
  ManagedServerRaiseInviewLevel = 5003,
  ManagedServerClone = 5004,
  VdcExpandStorage = 5005,
  VdcProvisionStorage = 5006,
  VdcScaleCompute = 5007,
  ManagedServerProvisionHids = 5008,
  ManagedServerProvisionServerBackup = 5009,
  ManagedServerProvisionVmBackup = 5010,

  PublicCloudLicenseChangeCount = 6000,

  // LaunchPad 7000-8999
  LaunchpadManagedServerCreate = 7000,
  LaunchpadManagementToolsAdd = 7001,
  LaunchpadManagementToolsDelete = 7002,
  LaunchpadBackupProvisionServerBackup = 7003,
  LaunchpadBackupProvisionVmBackup = 7004,
  LaunchpadDedicatedStorageUnmaskVolume = 7005,
  LaunchpadDedicatedStorageIncreaseVolume = 7006,
  LaunchpadHostSecurityProvisionAntiVirus = 7007,
  LaunchpadHostSecurityProvisionHids = 7008,
  LaunchpadDedicatedStorageCreateAttachVolume = 7009,
  LaunchpadDedicatedStorageAttachVolume = 7010,
  LaunchpadDedicatedStorageCreateAttachVolumeCluster = 7011,
  LaunchpadDedicatedStorageAttachVolumeCluster = 7012,
  LaunchpadDedicatedStorageRemoveZoning = 7013,
}

/**
 * Enumeration serializer and deserializer methods
 */
export class TaskTypeSerialization
  extends McsEnumSerializationBase<TaskType> {
  constructor() { super(TaskType); }
}
