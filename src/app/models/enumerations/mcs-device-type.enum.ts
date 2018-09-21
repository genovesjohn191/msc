import { McsEnumSerializationBase } from '@app/core';
import { CacheKey } from 'json-object-mapper';

export enum McsDeviceType {
  Desktop,
  Tablet,
  MobileLandscape,
  MobilePortrait
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('McsDeviceTypeSerialization')
export class McsDeviceTypeSerialization
  extends McsEnumSerializationBase<McsDeviceType> {
  constructor() { super(McsDeviceType); }
}
