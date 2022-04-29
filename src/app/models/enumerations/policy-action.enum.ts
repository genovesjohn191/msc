import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum PolicyAction {
  Accept,
  Deny,
  Add,
  Modify,
  Remove
}

export const policyText = {
  [PolicyAction.Accept]: 'Accept',
  [PolicyAction.Deny]: 'Deny',
  [PolicyAction.Add]: 'Add',
  [PolicyAction.Modify]: 'Modify',
  [PolicyAction.Remove]: 'Remove'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class PolicyActionSerialization
  extends McsEnumSerializationBase<PolicyAction> {
  constructor() { super(PolicyAction); }
}
