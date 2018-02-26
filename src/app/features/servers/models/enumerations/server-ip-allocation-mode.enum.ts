import { McsEnumSerializationBase } from '../../../../core';
import { CacheKey } from 'json-object-mapper';

export enum ServerIpAllocationMode {
  None = 0,
  Dhcp = 1,
  Pool = 2,
  Manual = 3
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('ServerIpAllocationModeSerialization')
export class ServerIpAllocationModeSerialization
  extends McsEnumSerializationBase<ServerIpAllocationMode> {
  constructor() { super(ServerIpAllocationMode); }
}
