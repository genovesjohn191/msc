import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum CommentType {
  Comments = 0,
  WorkNotes,
  CommentsAndWorkNotes,
  FailureDescription,
  ApprovalHistory,
  Mt,
  Other
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('CommentTypeSerialization')
export class CommentTypeSerialization
  extends McsEnumSerializationBase<CommentType> {
  constructor() { super(CommentType); }
}
