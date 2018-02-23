import { McsEnumSerializationBase } from '../../../../core';

export enum ServerCatalogType {
  Managed = 0,
  SelfManaged = 1,
  Public = 2
}

/**
 * Enumeration serializer and deserializer methods
 */
export class ServerCatalogTypeSerialization
  extends McsEnumSerializationBase<ServerCatalogType> {
  constructor() { super(ServerCatalogType); }
}
