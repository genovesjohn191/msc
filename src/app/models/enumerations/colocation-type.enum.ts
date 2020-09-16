import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum ColocationType {
  Unknown = 0,
  Racks = 1,
  Antennas = 2,
  CustomDevices = 3,
  Rooms = 4,
  StandardSquareMetres = 5
}

export const colocationTypeText = {
    [ColocationType.Unknown]: 'Unknown',
    [ColocationType.Racks]: 'Racks',
    [ColocationType.Antennas]: 'Antennas',
    [ColocationType.CustomDevices]: 'Custom Devices',
    [ColocationType.Rooms]: 'Rooms',
    [ColocationType.StandardSquareMetres]: 'Standard Square Metres'
  };


/**
 * Enumeration serializer and deserializer methods
 */
export class ColocationTypeSerialization
  extends McsEnumSerializationBase<ColocationType> {
  constructor() { super(ColocationType); }
}
