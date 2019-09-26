import { McsEnumSerializationBase } from '@app/models';

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
