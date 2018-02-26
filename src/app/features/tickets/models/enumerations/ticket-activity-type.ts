import { McsEnumSerializationBase } from '../../../../core';
import { CacheKey } from 'json-object-mapper';

export enum TicketActivityType {
  Comment = 0,
  Attachment
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('TicketActivityTypeSerialization')
export class TicketActivityTypeSerialization
  extends McsEnumSerializationBase<TicketActivityType> {
  constructor() { super(TicketActivityType); }
}
