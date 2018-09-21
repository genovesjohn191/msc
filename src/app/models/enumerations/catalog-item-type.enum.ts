import { McsEnumSerializationBase } from '@app/core';
import { CacheKey } from 'json-object-mapper';

export enum CatalogItemType {
  Template = 0,
  Media = 1
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('CatalogItemTypeSerialization')
export class CatalogItemTypeSerialization
  extends McsEnumSerializationBase<CatalogItemType> {
  constructor() { super(CatalogItemType); }
}
