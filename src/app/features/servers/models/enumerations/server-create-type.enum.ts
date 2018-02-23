import { McsEnumSerializationBase } from '../../../../core';

export enum ServerCreateType {
  New = 0,
  Copy = 1,
  Clone = 2
}

/**
 * Enumeration serializer and deserializer methods
 */
export class ServerCreateTypeSerialization
  extends McsEnumSerializationBase<ServerCreateType> {
  constructor() { super(ServerCreateType); }
}
