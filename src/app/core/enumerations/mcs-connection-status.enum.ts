import { McsEnumSerializationBase } from '../factory/serialization/mcs-enum-serialization-base';
import { CacheKey } from 'json-object-mapper';

export enum McsConnectionStatus {
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
@CacheKey('McsConnectionStatusSerialization')
export class McsConnectionStatusSerialization
  extends McsEnumSerializationBase<McsConnectionStatus> {
  constructor() { super(McsConnectionStatus); }
}
