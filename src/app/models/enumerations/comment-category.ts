import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

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
