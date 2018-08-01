import { McsEnumSerializationBase } from '../../../../core';
import { CacheKey } from 'json-object-mapper';

export enum FirewallPolicyNat {
  Disabled = 0,
  Enabled = 1
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('FirewallPolicyNatSerialization')
export class FirewallPolicyNatSerialization
  extends McsEnumSerializationBase<FirewallPolicyNat> {
  constructor() { super(FirewallPolicyNat); }
}
