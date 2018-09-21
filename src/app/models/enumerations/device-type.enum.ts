import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '@app/core';

export enum DeviceType {
  Unknown = 0,
  Vmxnet3 = 1,
  E1000 = 2,
  E1000e = 3
}

export const deviceTypeText = {
  [DeviceType.Unknown]: 'Unknown',
  [DeviceType.Vmxnet3]: 'VMXNET3',
  [DeviceType.E1000]: 'E1000',
  [DeviceType.E1000e]: 'E1000e'
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('DeviceTypeSerialization')
export class DeviceTypeSerialization
  extends McsEnumSerializationBase<DeviceType> {
  constructor() { super(DeviceType); }
}
