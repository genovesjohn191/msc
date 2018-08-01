import { McsEnumSerializationBase } from '../../../../core';
import { CacheKey } from 'json-object-mapper';

export enum FirewallConnectionStatus {
  Unknown,
  Up,
  Down
}

export const firewallConnectionStatusText = {
  [FirewallConnectionStatus.Unknown]: 'Unknown',
  [FirewallConnectionStatus.Up]: 'Up',
  [FirewallConnectionStatus.Down]: 'Down'
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('FirewallConnectionStatusSerialization')
export class FirewallConnectionStatusSerialization
  extends McsEnumSerializationBase<FirewallConnectionStatus> {
  constructor() { super(FirewallConnectionStatus); }
}
