import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '@app/models';

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
