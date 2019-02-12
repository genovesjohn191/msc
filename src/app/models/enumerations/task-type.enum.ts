import { McsEnumSerializationBase } from '@app/core';
import { CacheKey } from 'json-object-mapper';

export enum TaskType {
  Undefined = 0,

  // Core
  // Range 1-2999
  RefreshProductCatalogCache = 1,

  // Orchestration
  // Range 3000-4999
  ChangeServerPowerState = 3000,
  CreateServer = 3001,
  UpdateServerCompute = 3002,
  DeleteServer = 3003,
  CreateServerSnapshot = 3004,
  ApplyServerSnapshot = 3005,
  DeleteServerSnapshot = 3006,
  CreateServerDisk = 3007,
  UpdateServerDisk = 3008,
  DeleteServerDisk = 3009,
  CloneServer = 3010,
  ResetServerPassword = 3011,
  CreateServerNic = 3012,
  UpdateServerNic = 3013,
  DeleteServerNic = 3014,
  AttachServerMedia = 3015,
  DetachServerMedia = 3016,
  RenameServer = 3017,
  CreateResourceCatalogItem = 3018,
  PerformServerOsUpdateAnalysis = 3019,
  ApplyServerOsUpdates = 3020,

  // Orchestration Ordering
  // Range 5000-6999
  ProvisionCreateServer = 5000,
  ProvisionAntiVirusFeature = 5001
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('TaskTypeSerialization')
export class TaskTypeSerialization
  extends McsEnumSerializationBase<TaskType> {
  constructor() { super(TaskType); }
}
