import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum NetworkStatus {
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
@CacheKey('NetworkStatusSerialization')
export class NetworkStatusSerialization
  extends McsEnumSerializationBase<NetworkStatus> {
  constructor() { super(NetworkStatus); }
}
