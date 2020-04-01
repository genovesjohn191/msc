import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum CatalogViewType {
  Products = 0,
  Solutions,
  ProductPlatform,
  Product,
  Solution
}

/**
 * Enumeration serializer and deserializer methods
 */
export class CatalogViewTypeSerialization
  extends McsEnumSerializationBase<CatalogViewType> {
  constructor() { super(CatalogViewType); }
}
