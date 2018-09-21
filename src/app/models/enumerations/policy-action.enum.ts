import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '@app/core';

export enum PolicyAction {
  Disabled = 0,
  Enabled = 1
}

export const policyText = {
  [PolicyAction.Disabled]: 'Disabled',
  [PolicyAction.Enabled]: 'Enabled'
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('PolicyActionSerialization')
export class PolicyActionSerialization
  extends McsEnumSerializationBase<PolicyAction> {
  constructor() { super(PolicyAction); }
}
