import { McsEnumSerializationBase } from '../../../../core';
import { CacheKey } from 'json-object-mapper';

export enum FirewallPolicyAction {
  Disabled = 0,
  Enabled = 1
}

export const firewallPolicyText = {
  [FirewallPolicyAction.Disabled]: 'Disabled',
  [FirewallPolicyAction.Enabled]: 'Enabled'
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('FirewallPolicyActionSerialization')
export class FirewallPolicyActionSerialization
  extends McsEnumSerializationBase<FirewallPolicyAction> {
  constructor() { super(FirewallPolicyAction); }
}
