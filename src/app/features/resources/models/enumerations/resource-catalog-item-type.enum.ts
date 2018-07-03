import { McsEnumSerializationBase } from '../../../../core';
import { CacheKey } from 'json-object-mapper';

export enum ResourceCatalogItemType {
  Template = 0,
  Media = 1
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('ResourceCatalogItemTypeSerialization')
export class ResourceCatalogItemTypeSerialization
  extends McsEnumSerializationBase<ResourceCatalogItemType> {
  constructor() { super(ResourceCatalogItemType); }
}
