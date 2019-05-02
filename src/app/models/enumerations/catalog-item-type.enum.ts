import { McsEnumSerializationBase } from '@app/core';
import { CacheKey } from 'json-object-mapper';

export enum CatalogItemType {
  Unknown = 0,
  Template = 1,
  Media = 2
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('CatalogItemTypeSerialization')
export class CatalogItemTypeSerialization
  extends McsEnumSerializationBase<CatalogItemType> {
  constructor() { super(CatalogItemType); }
}
