import { McsEnumSerializationBase } from '../../../../core';
import { CacheKey } from 'json-object-mapper';

export enum ServerCatalogItemType {
  Template = 0,
  Media = 1
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('ServerCatalogItemTypeSerialization')
export class ServerCatalogItemTypeSerialization
  extends McsEnumSerializationBase<ServerCatalogItemType> {
  constructor() { super(ServerCatalogItemType); }
}
