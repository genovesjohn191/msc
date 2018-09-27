import { McsEnumSerializationBase } from '@app/core';
import { CacheKey } from 'json-object-mapper';

export enum DeviceMode {
  Desktop,
  Tablet,
  MobileLandscape,
  MobilePortrait
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('DeviceModeSerialization')
export class DeviceModeSerialization
  extends McsEnumSerializationBase<DeviceMode> {
  constructor() { super(DeviceMode); }
}
