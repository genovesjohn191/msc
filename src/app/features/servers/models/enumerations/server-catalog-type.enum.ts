import { McsEnumSerializationBase } from '../../../../core';
import { CacheKey } from 'json-object-mapper';

export enum ServerCatalogType {
  Managed = 0,
  SelfManaged = 1,
  Public = 2
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('ServerCatalogTypeSerialization')
export class ServerCatalogTypeSerialization
  extends McsEnumSerializationBase<ServerCatalogType> {
  constructor() { super(ServerCatalogType); }
}
