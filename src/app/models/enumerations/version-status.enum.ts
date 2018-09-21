import { McsEnumSerializationBase } from '@app/core';
import { CacheKey } from 'json-object-mapper';

export enum VersionStatus {
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
@CacheKey('VersionStatusSerialization')
export class VersionStatusSerialization
  extends McsEnumSerializationBase<VersionStatus> {
  constructor() { super(VersionStatus); }
}
