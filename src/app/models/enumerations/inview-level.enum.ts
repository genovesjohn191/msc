import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum InviewLevel {
  Unknown = 0,
  Standard,
  Premium,
  NotApplicable
}

export const inviewLevelText = {
  [InviewLevel.Unknown]: 'Unknown',
  [InviewLevel.Standard]: 'Standard',
  [InviewLevel.Premium]: 'Premium',
  [InviewLevel.NotApplicable]: 'Not Applicable'
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('InviewLevelSerialization')
export class InviewLevelSerialization
  extends McsEnumSerializationBase<InviewLevel> {
  constructor() { super(InviewLevel); }
}
