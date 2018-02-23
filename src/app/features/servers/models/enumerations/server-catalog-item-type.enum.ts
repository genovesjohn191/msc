import { McsEnumSerializationBase } from '../../../../core';

export enum ServerCatalogItemType {
  Template = 0,
  Media = 1
}

/**
 * Enumeration serializer and deserializer methods
 */
export class ServerCatalogItemTypeSerialization
  extends McsEnumSerializationBase<ServerCatalogItemType> {
  constructor() { super(ServerCatalogItemType); }
}
