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
export class TicketPrioritySerialization
  extends McsEnumSerializationBase<TicketPriority> {
  constructor() { super(TicketPriority); }
}
