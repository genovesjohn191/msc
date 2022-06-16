import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum HardwareType {
  UN = 0,
  BO = 1,
  LO = 2,
  VM = 3,
  BL = 4
}

export const hardwareTypeText = {
  [HardwareType.UN]: null,
  [HardwareType.BO]: 'Physical',
  [HardwareType.LO]: 'Logical',
  [HardwareType.VM]: 'Virtual Machine',
  [HardwareType.BL]: 'Blade',
};

/**
 * Enumeration serializer and deserializer methods
 */
export class HardwareTypeSerialization
  extends McsEnumSerializationBase<HardwareType> {
  constructor() { super(HardwareType); }
}