import { McsEnumSerializationBase } from '@app/core';
import { CacheKey } from 'json-object-mapper';

export enum JobType {
  Undefined = 0,
  // System Caching
  RefreshProductCatalogCache = 1,

  // Jobs for "/servers" endpoint must use prefix 100XXX followed by 3 digit number
  CreateServer = 100001,
  UpdateServerCompute = 100002,
  DeleteServer = 100003,
  CloneServer = 100004,
  RenameServer = 100005,
  ProvisionCreateServer = 100006,

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

  // Server Network Management
  CreateServerNic = 100251,
  UpdateServerNic = 100252,
  DeleteServerNic = 100253,

  // Server Media Management
  AttachServerMedia = 100301,
  DetachServerMedia = 100302,

  // Resource Media
  CreateResourceCatalogItem = 100401,

  // Os Updates
  PerformServerOsUpdateAnalysis = 100501,
  ApplyServerOsUpdates = 100502
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('JobTypeSerialization')
export class JobTypeSerialization
  extends McsEnumSerializationBase<JobType> {
  constructor() { super(JobType); }
}
