import { McsEnumSerializationBase } from '../../../../../core';

export enum FirewallConfigurationStatus {
  Unknown,
  InSync,
  OutOfSync
}

/**
 * Enumeration serializer and deserializer methods
 */
export class FirewallConfigurationStatusSerialization
  extends McsEnumSerializationBase<FirewallConfigurationStatus> {
  constructor() { super(FirewallConfigurationStatus); }
}
