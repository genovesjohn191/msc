import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '@app/core';

export enum OsType {
  Template = 1,
  Image
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('OsTypeSerialization')
export class OsTypeSerialization
  extends McsEnumSerializationBase<OsType> {
  constructor() { super(OsType); }
}