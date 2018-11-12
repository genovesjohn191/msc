import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '@app/core';

export enum PolicyNat {
  Disabled = 0,
  Enabled = 1
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('PolicyNatSerialization')
export class PolicyNatSerialization
  extends McsEnumSerializationBase<PolicyNat> {
  constructor() { super(PolicyNat); }
}