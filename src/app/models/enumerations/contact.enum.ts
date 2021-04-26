import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum Contact {
  None = 0,
  Phone = 1,
  Email = 2
}

/**
 * Enumeration serializer and deserializer methods
 */
export class ContactSerialization
  extends McsEnumSerializationBase<Contact> {
  constructor() { super(Contact); }
}
