import { McsEnumSerializationBase } from '../../../../core';
import { CacheKey } from 'json-object-mapper';

export enum ServerPlatformType {
  VCloud = 0,
  VCenter = 1,
  Ucs = 2
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('ServerPlatformTypeSerialization')
export class ServerPlatformTypeSerialization
  extends McsEnumSerializationBase<ServerPlatformType> {
  constructor() { super(ServerPlatformType); }
}
