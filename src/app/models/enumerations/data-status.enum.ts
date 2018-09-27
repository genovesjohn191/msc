import { McsEnumSerializationBase } from '@app/core';
import { CacheKey } from 'json-object-mapper';

export enum DataStatus {
  Error = -1,
  Success = 0,
  InProgress = 1,
  Empty = 2
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('DataStatusSerialization')
export class DataStatusSerialization
  extends McsEnumSerializationBase<DataStatus> {
  constructor() { super(DataStatus); }
}
