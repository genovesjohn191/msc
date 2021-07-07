import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum LicenseUnit {
  Licenses = 'Licenses',
  Gb = 'GB'
}

/**
 * Enumeration serializer and deserializer methods
 */
export class LicenseUnitSerialization
  extends McsEnumSerializationBase<LicenseUnit> {
  constructor() { super(LicenseUnit); }
}
