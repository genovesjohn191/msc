import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '@app/core';

export enum ProductAvailabilityState {
  Active,
  ActiveIncompleteRelease
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('ProductAvailabilityStateSerialization')
export class ProductAvailabilityStateSerialization
  extends McsEnumSerializationBase<ProductAvailabilityState> {
  constructor() { super(ProductAvailabilityState); }
}
