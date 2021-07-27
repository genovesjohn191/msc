import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum Temperature {
  Red = 1,
  Amber = 2,
  Green = 3
}

export const temperatureText = {
  [Temperature.Red]: 'Red',
  [Temperature.Amber]: 'Amber',
  [Temperature.Green]: 'Green'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class TemperatureSerialization
  extends McsEnumSerializationBase<Temperature> {
  constructor() { super(Temperature); }
}
