import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum CatalogItemType {
  Unknown = 0,
  Template = 1,
  Media = 2
}

/**
 * Enumeration serializer and deserializer methods
 */
export class CatalogItemTypeSerialization
  extends McsEnumSerializationBase<CatalogItemType> {
  constructor() { super(CatalogItemType); }
}
