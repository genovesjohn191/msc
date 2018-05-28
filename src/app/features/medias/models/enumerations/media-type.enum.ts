import { McsEnumSerializationBase } from '../../../../core';
import { CacheKey } from 'json-object-mapper';

export enum MediaType {
  Managed = 0,
  SelfManaged = 1,
  Public = 2
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('MediaTypeSerialization')
export class MediaTypeSerialization
  extends McsEnumSerializationBase<MediaType> {
  constructor() { super(MediaType); }
}
