import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum OrderCabinetLocation {
  Top = 0,
  Middle = 1,
  Bottom = 2
}

export const orderCabinetLocationText = {
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
