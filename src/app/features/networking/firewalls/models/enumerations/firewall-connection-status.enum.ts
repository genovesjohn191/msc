import { McsEnumSerializationBase } from '../../../../../core';

export enum FirewallConnectionStatus {
  Unknown,
  Up,
  Down
}

/**
 * Enumeration serializer and deserializer methods
 */
export class FirewallConnectionStatusSerialization
  extends McsEnumSerializationBase<FirewallConnectionStatus> {
  constructor() { super(FirewallConnectionStatus); }
}
