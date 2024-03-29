import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum IpAllocationMode {
  None = 0,
  Dhcp = 1,
  Pool = 2,
  Manual = 3
}

export const ipAllocationModeText = {
  [IpAllocationMode.None]: 'Unresolved',
  [IpAllocationMode.Dhcp]: 'DHCP',
  [IpAllocationMode.Pool]: 'Dynamic - IP Pool',
  [IpAllocationMode.Manual]: 'Manual'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class IpAllocationModeSerialization
  extends McsEnumSerializationBase<IpAllocationMode> {
  constructor() { super(IpAllocationMode); }
}
