import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '@app/core';

export enum PortStatus {
  Unknown = 0,
  Configured,
  InProgress,
  RecentlyChanged,
  CancellingRequested
}

export const portStatusText = {
  [PortStatus.Unknown]: 'Unknown',
  [PortStatus.Configured]: 'Configured',
  [PortStatus.InProgress]: 'In Progress',
  [PortStatus.RecentlyChanged]: 'Recenlty Changed',
  [PortStatus.CancellingRequested]: 'Cancelling Requested'
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('PortStatusSerialization')
export class PortStatusSerialization
  extends McsEnumSerializationBase<PortStatus> {
  constructor() { super(PortStatus); }
}
