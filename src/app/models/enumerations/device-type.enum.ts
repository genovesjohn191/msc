import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

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
export class DeviceTypeSerialization
  extends McsEnumSerializationBase<DeviceType> {
  constructor() { super(DeviceType); }
}
