import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum PolicyNat {
  Disabled = 0,
  Enabled = 1
}

/**
 * Enumeration serializer and deserializer methods
 */
export class PolicyNatSerialization
  extends McsEnumSerializationBase<PolicyNat> {
  constructor() { super(PolicyNat); }
}
