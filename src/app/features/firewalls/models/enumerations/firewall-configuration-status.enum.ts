import { McsEnumSerializationBase } from '../../../../core';
import { CacheKey } from 'json-object-mapper';

export enum FirewallConfigurationStatus {
  Unknown,
  InSync,
  OutOfSync
}

export const firewallConfigurationStatusText = {
  [FirewallConfigurationStatus.Unknown]: 'Unknown',
  [FirewallConfigurationStatus.InSync]: 'InSync',
  [FirewallConfigurationStatus.OutOfSync]: 'OutOfSync'
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('FirewallConfigurationStatusSerialization')
export class FirewallConfigurationStatusSerialization
  extends McsEnumSerializationBase<FirewallConfigurationStatus> {
  constructor() { super(FirewallConfigurationStatus); }
}
