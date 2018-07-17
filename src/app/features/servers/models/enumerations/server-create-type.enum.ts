import { McsEnumSerializationBase } from '../../../../core';
import { CacheKey } from 'json-object-mapper';

export enum ServerCreateType {
  New = 1,
  Clone = 2,
  Copy = 3
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('ServerCreateTypeSerialization')
export class ServerCreateTypeSerialization
  extends McsEnumSerializationBase<ServerCreateType> {
  constructor() { super(ServerCreateType); }
}
