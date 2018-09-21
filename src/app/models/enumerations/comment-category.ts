import { McsEnumSerializationBase } from '@app/core';
import { CacheKey } from 'json-object-mapper';

export enum CommentCategory {
  Task = 0,
  Problem = 1,
  Incident = 2
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('CommentCategorySerialization')
export class CommentCategorySerialization
  extends McsEnumSerializationBase<CommentCategory> {
  constructor() { super(CommentCategory); }
}
