import { McsEnumSerializationBase } from '../factory/serialization/mcs-enum-serialization-base';
import { CacheKey } from 'json-object-mapper';

export enum McsJobType {
  Undefined = 0,

  // Jobs for "/servers" endpoint must use prefix 100XXX followed by 3 digit number
  CreateServer = 100001,
  UpdateServerCompute = 100002,
  DeleteServer = 100003,
  CloneServer = 100004,
  RenameServer = 100005,

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
  CreateServerNetwork = 100251,
  UpdateServerNetwork = 100252,
  DeleteServerNetwork = 100253,

  // Server Media Management
  AttachServerMedia = 100301,
  DetachServerMedia = 100302
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('McsJobTypeSerialization')
export class McsJobTypeSerialization
  extends McsEnumSerializationBase<McsJobType> {
  constructor() { super(McsJobType); }
}
