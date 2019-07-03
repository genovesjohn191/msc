import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum InviewLevel {
  None = 0,
  Standard,
  Premium
}

export const inviewLevelText = {
  [InviewLevel.None]: 'None',
  [InviewLevel.Standard]: 'Standard',
  [InviewLevel.Premium]: 'Premium'
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('InviewLevelSerialization')
export class InviewLevelSerialization
  extends McsEnumSerializationBase<InviewLevel> {
  constructor() { super(InviewLevel); }
}
