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

export const ticketStatusText = {
  [TicketStatus.Undefined]: 'Undefined',
  [TicketStatus.New]: 'New',
  [TicketStatus.InProgress]: 'InProgress',
  [TicketStatus.AwaitingCustomer]: 'Awaiting Customer',
  [TicketStatus.Resolved]: 'Resolved',
  [TicketStatus.Closed]: 'Closed',
  [TicketStatus.WaitForRfo]: 'Wait For Rfo',
  [TicketStatus.WaitingForTaskCompletion]: 'Waiting For Task Completion',
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('TicketStatusSerialization')
export class TicketStatusSerialization
  extends McsEnumSerializationBase<TicketStatus> {
  constructor() { super(TicketStatus); }
}
