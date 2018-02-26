import { McsEnumSerializationBase } from '../../../../../core';
import { CacheKey } from 'json-object-mapper';

export enum FirewallDeviceStatus {
  None = -1,
  Unknown = 0,
  CheckedIn = 1,
  InProgress = 2,
  Installed = 3,
  Aborted = 4,
  Sched = 5,
  Retry = 6,
  Cancelled = 7,
  Pending = 8,
  Retrieved = 9,
  ChangedConfig = 10,
  SyncFailed = 11,
  Timeout = 12,
  Reverted = 13,
  AutoUpdated = 14
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('FirewallDeviceStatusSerialization')
export class FirewallDeviceStatusSerialization
  extends McsEnumSerializationBase<FirewallDeviceStatus> {
  constructor() { super(FirewallDeviceStatus); }
}
