import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum JobType {
  Undefined = 0,
  // Caching
  RefreshProductCatalogCache = 1,

  // Jobs for "/servers" endpoint must use prefix 100XXX followed by 3 digit number
  CreateServer = 100001,
  UpdateServerCompute = 100002,
  DeleteServer = 100003,
  CloneServer = 100004,
  RenameServer = 100005,
  ProvisionCreateServer = 100006,
  ScaleManagedServer = 100007,
  RaiseManagedServerInviewLevel = 100008,
  CloneManagedServer = 100009,

  // Server Snapshot
  CreateServerSnapshot = 100051,
  ApplyServerSnapshot = 100052,
  DeleteServerSnapshot = 100053,

  // Server Command
  ChangeServerPowerState = 100101,

  // Server Disk Management
  CreateServerDisk = 100151,
  UpdateServerDisk = 100152,
  DeleteServerDisk = 100153,

  // Server Password
  ResetServerPassword = 100201,

  // Server NIC Management
  CreateServerNic = 100251,
  UpdateServerNic = 100252,
  DeleteServerNic = 100253,

  // Server Media Management
  AttachServerMedia = 100301,
  DetachServerMedia = 100302,

  // Resource Media
  CreateResourceCatalogItem = 100401,

  // Patching
  PerformServerOsUpdateAnalysis = 100501,
  ApplyServerOsUpdates = 100502,

  // VDC Storage
  ExpandVdcStorage = 100601,
  ProvisionVdcStorage = 100602,
  ScaleVdcCompute = 100603,

  // Host Security
  ProvisionAntiVirus = 100604,
  ProvisionHids = 100605,

  // Backup
  ProvisionServerBackup = 100606,
  ProvisionVmBackup = 100607
}

export const jobTypeText = {
  [JobType.CreateServer]: 'New Server',
  [JobType.UpdateServerCompute]: 'Scale Server',
  [JobType.DeleteServer]: 'Delete Server',
  [JobType.CloneServer]: 'Clone Server',
  [JobType.RenameServer]: 'Rename Server',
  [JobType.ProvisionCreateServer]: 'New Managed Server',
  [JobType.CreateServerSnapshot]: 'New Snapshot',
  [JobType.ApplyServerSnapshot]: 'Restore Snapshot',
  [JobType.DeleteServerSnapshot]: 'Delete Snapshot',
  [JobType.ChangeServerPowerState]: 'Change Server Power-state',
  [JobType.CreateServerDisk]: 'New Disk',
  [JobType.UpdateServerDisk]: 'Scale Disk',
  [JobType.DeleteServerDisk]: 'Delete Disk',
  [JobType.ResetServerPassword]: 'Reset Server Password',
  [JobType.CreateServerNic]: 'New NIC',
  [JobType.UpdateServerNic]: 'Update NIC',
  [JobType.DeleteServerNic]: 'Delete NIC',
  [JobType.AttachServerMedia]: 'Attach Media',
  [JobType.DetachServerMedia]: 'Detach Media',
  [JobType.CreateResourceCatalogItem]: 'New Catalog Media',
  [JobType.PerformServerOsUpdateAnalysis]: 'Perform OS Inspection',
  [JobType.ApplyServerOsUpdates]: 'Apply OS Updates',
  [JobType.ScaleManagedServer]: 'Scale Managed Server',
  [JobType.RaiseManagedServerInviewLevel]: 'Raise Managed Server Inview Level',
  [JobType.ScaleVdcCompute]: 'Scale VDC',
  [JobType.ProvisionServerBackup]: 'Backup Server',
  [JobType.ProvisionVmBackup]: 'Backup VM'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class JobTypeSerialization
  extends McsEnumSerializationBase<JobType> {
  constructor() { super(JobType); }
}
