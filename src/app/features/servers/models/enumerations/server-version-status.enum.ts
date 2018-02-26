import { McsEnumSerializationBase } from '../../../../core';
import { CacheKey } from 'json-object-mapper';

export enum ServerVersionStatus {
  Unmanaged = 0,
  SupportedOld = 1,
  SupportedNew = 2,
  Current = 3,
  TooOld = 4,
  NotInstalled = 5
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('ServerVersionStatusSerialization')
export class ServerVersionStatusSerialization
  extends McsEnumSerializationBase<ServerVersionStatus> {
  constructor() { super(ServerVersionStatus); }
}
