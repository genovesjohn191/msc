import { McsEnumSerializationBase } from '../../../../core';
import { CacheKey } from 'json-object-mapper';

export enum ResourceIpAllocationMode {
  None = 0,
  Dhcp = 1,
  Pool = 2,
  Manual = 3
}

export const resourceIpAllocationModeText = {
  [ResourceIpAllocationMode.None]: 'Unresolved',
  [ResourceIpAllocationMode.Dhcp]: 'DHCP',
  [ResourceIpAllocationMode.Pool]: 'Dynamic - IP Pool',
  [ResourceIpAllocationMode.Manual]: 'Manual'
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('ResourceIpAllocationModeSerialization')
export class ResourceIpAllocationModeSerialization
  extends McsEnumSerializationBase<ResourceIpAllocationMode> {
  constructor() { super(ResourceIpAllocationMode); }
}
