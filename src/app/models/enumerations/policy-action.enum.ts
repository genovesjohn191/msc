import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

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
export class PolicyActionSerialization
  extends McsEnumSerializationBase<PolicyAction> {
  constructor() { super(PolicyAction); }
}
