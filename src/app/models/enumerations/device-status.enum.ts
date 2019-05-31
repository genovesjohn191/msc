import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum DeviceStatus {
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

export const deviceStatusText = {
  [DeviceStatus.None]: 'None',
  [DeviceStatus.Unknown]: 'Unknown',
  [DeviceStatus.CheckedIn]: 'CheckedIn',
  [DeviceStatus.InProgress]: 'InProgress',
  [DeviceStatus.Installed]: 'Installed',
  [DeviceStatus.Aborted]: 'Aborted',
  [DeviceStatus.Sched]: 'Sched',
  [DeviceStatus.Retry]: 'Retry',
  [DeviceStatus.Cancelled]: 'Cancelled',
  [DeviceStatus.Pending]: 'Pending',
  [DeviceStatus.Retrieved]: 'Retrieved',
  [DeviceStatus.ChangedConfig]: 'ChangedConfig',
  [DeviceStatus.SyncFailed]: 'SyncFailed',
  [DeviceStatus.Timeout]: 'Timeout',
  [DeviceStatus.Reverted]: 'Reverted',
  [DeviceStatus.AutoUpdated]: 'AutoUpdated'
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('DeviceStatusSerialization')
export class DeviceStatusSerialization
  extends McsEnumSerializationBase<DeviceStatus> {
  constructor() { super(DeviceStatus); }
}
