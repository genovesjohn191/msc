import { McsEnumSerializationBase } from '../../../../core';

export enum TicketActivityType {
  Comment = 0,
  Attachment
}

/**
 * Enumeration serializer and deserializer methods
 */
export class TicketActivityTypeSerialization
  extends McsEnumSerializationBase<TicketActivityType> {
  constructor() { super(TicketActivityType); }
}
