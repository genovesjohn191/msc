import { McsOption } from '../common/mcs-option';
import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum TicketType {
  None = 0,
  Enquiry,
  TroubleTicket
}

export const ticketTypeText = {
  [TicketType.None]: 'Undefined',
  [TicketType.Enquiry]: 'Enquiry',
  [TicketType.TroubleTicket]: 'Trouble Ticket'
};

export const ticketTypeOptions = [
  new McsOption(TicketType.Enquiry, ticketTypeText[TicketType.Enquiry]),
  new McsOption(TicketType.TroubleTicket, ticketTypeText[TicketType.TroubleTicket])
]

/**
 * Enumeration serializer and deserializer methods
 */
export class TicketTypeSerialization
  extends McsEnumSerializationBase<TicketType> {
  constructor() { super(TicketType); }
}
