import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum ProductAvailabilityState {
  Active,
  ActiveIncompleteRelease
}

/**
 * Enumeration serializer and deserializer methods
 */
export class ProductAvailabilityStateSerialization
  extends McsEnumSerializationBase<ProductAvailabilityState> {
  constructor() { super(ProductAvailabilityState); }
}
