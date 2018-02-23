import { McsEnumSerializationBase } from '../../../../../core';

export enum FirewallPolicyAction {
  Disabled = 0,
  Enabled = 1
}

/**
 * Enumeration serializer and deserializer methods
 */
export class FirewallPolicyActionSerialization
  extends McsEnumSerializationBase<FirewallPolicyAction> {
  constructor() { super(FirewallPolicyAction); }
}
