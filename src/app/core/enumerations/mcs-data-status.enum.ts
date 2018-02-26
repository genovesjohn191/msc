import { McsEnumSerializationBase } from '../factory/serialization/mcs-enum-serialization-base';
import { CacheKey } from 'json-object-mapper';

export enum McsDataStatus {
  Error = -1,
  Success = 0,
  InProgress = 1,
  Empty = 2
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('McsDataStatusSerialization')
export class McsDataStatusSerialization
  extends McsEnumSerializationBase<McsDataStatus> {
  constructor() { super(McsDataStatus); }
}
