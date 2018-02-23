import { McsEnumSerializationBase } from '../../../../core';

export enum ServerPlatformType {
  VCloud = 0,
  VCenter = 1,
  Ucs = 2
}

/**
 * Enumeration serializer and deserializer methods
 */
export class ServerPlatformTypeSerialization
  extends McsEnumSerializationBase<ServerPlatformType> {
  constructor() { super(ServerPlatformType); }
}
