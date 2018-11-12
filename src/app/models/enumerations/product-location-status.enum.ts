import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '@app/core';

export enum ProductLocationStatus {
  Unknown = 0,
  Active = 1,
  Inactive = 2
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('ProductLocationStatusSerialization')
export class ProductLocationStatusSerialization
  extends McsEnumSerializationBase<ProductLocationStatus> {
  constructor() { super(ProductLocationStatus); }
}
