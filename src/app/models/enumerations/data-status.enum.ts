import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum DataStatus {
  Error = -1,
  Success = 0,
  PreActive = 1,
  Active = 2,
  Empty = 3
}

/**
 * Enumeration serializer and deserializer methods
 */
export class DataStatusSerialization
  extends McsEnumSerializationBase<DataStatus> {
  constructor() { super(DataStatus); }
}
