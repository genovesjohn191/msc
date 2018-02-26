import { McsEnumSerializationBase } from '../factory/serialization/mcs-enum-serialization-base';
import { CacheKey } from 'json-object-mapper';

export enum McsConnectionStatus {
  Success = 0,
  Retrying = 1,
  Failed = -1,
  Fatal = -2
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('McsConnectionStatusSerialization')
export class McsConnectionStatusSerialization
  extends McsEnumSerializationBase<McsConnectionStatus> {
  constructor() { super(McsConnectionStatus); }
}
