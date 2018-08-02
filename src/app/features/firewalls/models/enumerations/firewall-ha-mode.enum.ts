import { McsEnumSerializationBase } from '../../../../core';
import { CacheKey } from 'json-object-mapper';

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
@CacheKey('FirewallHaModeSerialization')
export class FirewallHaModeSerialization
  extends McsEnumSerializationBase<FirewallHaMode> {
  constructor() { super(FirewallHaMode); }
}
