import { McsEnumSerializationBase } from '../../../../../core';

export enum FirewallPolicyNat {
  Disabled = 0,
  Enabled = 1
}

/**
 * Enumeration serializer and deserializer methods
 */
export class FirewallPolicyNatSerialization
  extends McsEnumSerializationBase<FirewallPolicyNat> {
  constructor() { super(FirewallPolicyNat); }
}
