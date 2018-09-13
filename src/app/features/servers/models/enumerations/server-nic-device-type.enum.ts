import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '../../../../core';

export enum ServerNicDeviceType {
  Unknown = 0,
  Vmxnet3 = 1,
  E1000 = 2,
  E1000e = 3
}

export const serverNicDeviceTypeText = {
  [ServerNicDeviceType.Unknown]: 'Unknown',
  [ServerNicDeviceType.Vmxnet3]: 'VMXNET3',
  [ServerNicDeviceType.E1000]: 'E1000',
  [ServerNicDeviceType.E1000e]: 'E1000e'
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('ServerNicDeviceTypeSerialization')
export class ServerNicDeviceTypeSerialization
  extends McsEnumSerializationBase<ServerNicDeviceType> {
  constructor() { super(ServerNicDeviceType); }
}
