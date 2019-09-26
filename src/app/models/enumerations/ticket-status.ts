import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

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
  [TicketStatus.InProgress]: 'In Progress',
  [TicketStatus.AwaitingCustomer]: 'Awaiting Customer',
  [TicketStatus.Resolved]: 'Resolved',
  [TicketStatus.Closed]: 'Closed',
  [TicketStatus.WaitForRfo]: 'Wait For Rfo',
  [TicketStatus.WaitingForTaskCompletion]: 'Waiting For Task Completion',
};

/**
 * Enumeration serializer and deserializer methods
 */
export class TicketStatusSerialization
  extends McsEnumSerializationBase<TicketStatus> {
  constructor() { super(TicketStatus); }
}
