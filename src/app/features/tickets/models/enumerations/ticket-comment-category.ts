import { McsEnumSerializationBase } from '../../../../core';

export enum TicketCommentCategory {
  Task = 0,
  Problem = 1,
  Incident = 2
}

/**
 * Enumeration serializer and deserializer methods
 */
export class TicketCommentCategorySerialization
  extends McsEnumSerializationBase<TicketCommentCategory> {
  constructor() { super(TicketCommentCategory); }
}
