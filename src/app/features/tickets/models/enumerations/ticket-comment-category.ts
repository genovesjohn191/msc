import { McsEnumSerializationBase } from '../../../../core';
import { CacheKey } from 'json-object-mapper';

export enum TicketCommentCategory {
  Task = 0,
  Problem = 1,
  Incident = 2
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('TicketCommentCategorySerialization')
export class TicketCommentCategorySerialization
  extends McsEnumSerializationBase<TicketCommentCategory> {
  constructor() { super(TicketCommentCategory); }
}
