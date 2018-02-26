import { McsEnumSerializationBase } from '../../../../core';
import { CacheKey } from 'json-object-mapper';

export enum ServerImageType {
  Os = 0,
  Template = 1
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('ServerImageTypeSerialization')
export class ServerImageTypeSerialization
  extends McsEnumSerializationBase<ServerImageType> {
  constructor() { super(ServerImageType); }
}
