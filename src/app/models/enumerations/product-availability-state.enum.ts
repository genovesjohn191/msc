import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

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
