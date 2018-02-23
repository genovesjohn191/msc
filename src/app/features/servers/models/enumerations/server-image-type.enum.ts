import { McsEnumSerializationBase } from '../../../../core';

export enum ServerImageType {
  Os = 0,
  Template = 1
}

/**
 * Enumeration serializer and deserializer methods
 */
export class ServerImageTypeSerialization
  extends McsEnumSerializationBase<ServerImageType> {
  constructor() { super(ServerImageType); }
}
