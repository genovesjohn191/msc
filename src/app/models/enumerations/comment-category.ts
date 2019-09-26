import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum CommentCategory {
  Task = 0,
  Problem = 1,
  Incident = 2
}

/**
 * Enumeration serializer and deserializer methods
 */
export class CommentCategorySerialization
  extends McsEnumSerializationBase<CommentCategory> {
  constructor() { super(CommentCategory); }
}
