import { McsEnumSerializationBase } from '@app/core';
import { CacheKey } from 'json-object-mapper';

export enum McsNetworkStatus {
  Success = 0,
  Connecting = 1,
  Reconnecting = 2,
  Failed = -1,
  Fatal = -2,
  NoData = -3
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('McsNetworkStatusSerialization')
export class McsNetworkStatusSerialization
  extends McsEnumSerializationBase<McsNetworkStatus> {
  constructor() { super(McsNetworkStatus); }
}
