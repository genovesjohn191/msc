import { McsEnumSerializationBase } from '../factory/serialization/mcs-enum-serialization-base';
import { CacheKey } from 'json-object-mapper';

export enum McsJobStatus {
  Pending = 0,
  Active = 1,
  Completed = 2,
  Cancelled = 3,
  Failed = 4,
  Timedout = 5,
  SessionExpired = 6
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('McsJobStatusSerialization')
export class McsJobStatusSerialization
  extends McsEnumSerializationBase<McsJobStatus> {
  constructor() { super(McsJobStatus); }
}
