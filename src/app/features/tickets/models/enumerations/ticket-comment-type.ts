import { McsEnumSerializationBase } from '../../../../core';

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
export class TicketCommentTypeSerialization
  extends McsEnumSerializationBase<TicketCommentType> {
  constructor() { super(TicketCommentType); }
}
