import { McsEnumSerializationBase } from '../../../../core';
import { CacheKey } from 'json-object-mapper';

export enum ServerInputManageType {
  Slider = 0,
  Custom = 1,
  Buttons = 2
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('ServerInputManageTypeSerialization')
export class ServerInputManageTypeSerialization
  extends McsEnumSerializationBase<ServerInputManageType> {
  constructor() { super(ServerInputManageType); }
}
