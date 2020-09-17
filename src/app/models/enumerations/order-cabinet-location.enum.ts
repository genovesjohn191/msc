import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum OrderCabinetLocation {
  Unknown = 0,
  Top = 1,
  Middle = 2,
  Bottom = 3
}

export const orderRemoteHandsCabinetLocationText = {
  [OrderCabinetLocation.Top]: 'Top',
  [OrderCabinetLocation.Middle]: 'Middle',
  [OrderCabinetLocation.Bottom]: 'Bottom'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class OrderCabinetLocationSerialization
  extends McsEnumSerializationBase<OrderCabinetLocation> {
  constructor() { super(OrderCabinetLocation); }
}
