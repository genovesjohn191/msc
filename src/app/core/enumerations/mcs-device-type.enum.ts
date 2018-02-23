import { McsEnumSerializationBase } from '../factory/serialization/mcs-enum-serialization-base';

export enum McsDeviceType {
  Desktop,
  Tablet,
  MobileLandscape,
  MobilePortrait
}

/**
 * Enumeration serializer and deserializer methods
 */
export class McsDeviceTypeSerialization
  extends McsEnumSerializationBase<McsDeviceType> {
  constructor() { super(McsDeviceType); }
}
