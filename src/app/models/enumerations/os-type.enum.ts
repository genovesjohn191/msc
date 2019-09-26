import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum OsType {
  Template = 1,
  Image
}

/**
 * Enumeration serializer and deserializer methods
 */
export class OsTypeSerialization
  extends McsEnumSerializationBase<OsType> {
  constructor() { super(OsType); }
}
