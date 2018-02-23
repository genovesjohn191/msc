import { McsEnumSerializationBase } from '../factory/serialization/mcs-enum-serialization-base';

export enum McsDataStatus {
  Error = -1,
  Success = 0,
  InProgress = 1,
  Empty = 2
}

/**
 * Enumeration serializer and deserializer methods
 */
export class McsDataStatusSerialization
  extends McsEnumSerializationBase<McsDataStatus> {
  constructor() { super(McsDataStatus); }
}
