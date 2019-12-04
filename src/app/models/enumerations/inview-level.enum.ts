import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum InviewLevel {
  Standard = 0,
  Premium,
  None
}

export const inviewLevelText = {
  [InviewLevel.None]: 'None',
  [InviewLevel.Standard]: 'Standard',
  [InviewLevel.Premium]: 'Premium'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class InviewLevelSerialization
  extends McsEnumSerializationBase<InviewLevel> {
  constructor() { super(InviewLevel); }
}
