import { McsEnumSerializationBase } from '../../../../../core';

export enum FirewallHaMode {
  Unknown,
  Standalone,
  ActivePassive,
  ActiveActive,
  Elbc,
  Dual,
  Enabled
}

/**
 * Enumeration serializer and deserializer methods
 */
export class FirewallHaModeSerialization
  extends McsEnumSerializationBase<FirewallHaMode> {
  constructor() { super(FirewallHaMode); }
}
