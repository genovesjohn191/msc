import { McsEnumSerializationBase } from '../../../../core';
import { CacheKey } from 'json-object-mapper';

export enum TicketStatus {
  Undefined = 0,
  New,
  InProgress,
  AwaitingCustomer,
  Resolved,
  Closed,
  WaitForRfo,
  WaitingForTaskCompletion
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('TicketStatusSerialization')
export class TicketStatusSerialization
  extends McsEnumSerializationBase<TicketStatus> {
  constructor() { super(TicketStatus); }
}
