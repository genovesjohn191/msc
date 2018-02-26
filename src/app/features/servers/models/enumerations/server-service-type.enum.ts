import { McsEnumSerializationBase } from '../../../../core';
import { CacheKey } from 'json-object-mapper';

export enum ServerServiceType {
  Managed = 0,
  SelfManaged = 1
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('ServerServiceTypeSerialization')
export class ServerServiceTypeSerialization
  extends McsEnumSerializationBase<ServerServiceType> {
  constructor() { super(ServerServiceType); }
}
