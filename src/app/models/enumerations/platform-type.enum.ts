import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum PlatformType {
  VCloud = 0,
  VCenter = 1,
  Ucs = 2
}

export const platformTypeText = {
  [PlatformType.VCloud]: 'VCloud',
  [PlatformType.VCenter]: 'VCenter',
  [PlatformType.Ucs]: 'Ucs'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class PlatformTypeSerialization
  extends McsEnumSerializationBase<PlatformType> {
  constructor() { super(PlatformType); }
}
