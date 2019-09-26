import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum DataStatus {
  Error = -1,
  Success = 0,
  InProgress = 1,
  Empty = 2
}

/**
 * Enumeration serializer and deserializer methods
 */
export class DataStatusSerialization
  extends McsEnumSerializationBase<DataStatus> {
  constructor() { super(DataStatus); }
}
