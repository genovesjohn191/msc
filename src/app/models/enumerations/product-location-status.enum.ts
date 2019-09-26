import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum ProductLocationStatus {
  Unknown = 0,
  Active = 1,
  Inactive = 2
}

/**
 * Enumeration serializer and deserializer methods
 */
export class ProductLocationStatusSerialization
  extends McsEnumSerializationBase<ProductLocationStatus> {
  constructor() { super(ProductLocationStatus); }
}
