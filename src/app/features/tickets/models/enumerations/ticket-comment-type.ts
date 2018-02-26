import { McsEnumSerializationBase } from '../../../../core';
import { CacheKey } from 'json-object-mapper';

export enum TicketCommentType {
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
@CacheKey('TicketCommentTypeSerialization')
export class TicketCommentTypeSerialization
  extends McsEnumSerializationBase<TicketCommentType> {
  constructor() { super(TicketCommentType); }
}
