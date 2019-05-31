import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum TicketPriority {
  Unresolved = 0,
  Critical,
  High,
  Moderate,
  Low
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('TicketPrioritySerialization')
export class TicketPrioritySerialization
  extends McsEnumSerializationBase<TicketPriority> {
  constructor() { super(TicketPriority); }
}
