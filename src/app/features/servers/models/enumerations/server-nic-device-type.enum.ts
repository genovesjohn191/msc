import { McsEnumSerializationBase } from '../../../../core';
import { CacheKey } from 'json-object-mapper';

export enum ServerNicDeviceType {
  Unknown = 0,
  Vmxnet3 = 1,
  E100 = 2,
  E100e = 3
}

export const serverNicDeviceTypeText = {
  [ServerNicDeviceType.Unknown]: 'Unknown',
  [ServerNicDeviceType.Vmxnet3]: 'VMXNET3',
  [ServerNicDeviceType.E100]: 'E100',
  [ServerNicDeviceType.E100e]: 'E100e'
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('ServerNicDeviceTypeSerialization')
export class ServerNicDeviceTypeSerialization
  extends McsEnumSerializationBase<ServerNicDeviceType> {
  constructor() { super(ServerNicDeviceType); }
}
