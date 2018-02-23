import { McsEnumSerializationBase } from '../../../../core';

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
export class TicketStatusSerialization
  extends McsEnumSerializationBase<TicketStatus> {
  constructor() { super(TicketStatus); }
}
