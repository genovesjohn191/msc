import { McsEnumSerializationBase } from '../../../../core';
import { CacheKey } from 'json-object-mapper';

export enum ResourceCatalogType {
  Managed = 0,
  SelfManaged = 1,
  Public = 2
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('ResourceCatalogTypeSerialization')
export class ResourceCatalogTypeSerialization
  extends McsEnumSerializationBase<ResourceCatalogType> {
  constructor() { super(ResourceCatalogType); }
}
